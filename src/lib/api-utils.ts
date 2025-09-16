/**
 * Safely parse JSON response, handling cases where HTML error pages are returned
 */
export async function safeJsonParse(response: Response) {
  const contentType = response.headers.get('content-type');
  
  // Check if the response is actually JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    
    // If it's an HTML error page, throw a more descriptive error
    if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
      throw new Error(`Server returned HTML error page instead of JSON. Status: ${response.status} ${response.statusText}`);
    }
    
    // If it's some other non-JSON content, throw an error with the content
    throw new Error(`Expected JSON but received: ${contentType}. Content: ${text.substring(0, 200)}...`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    const text = await response.text();
    throw new Error(`Failed to parse JSON response: ${error}. Content: ${text.substring(0, 200)}...`);
  }
}

/**
 * Enhanced fetch wrapper with better error handling
 */
export async function apiRequest(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    // For non-JSON responses (like redirects), return the response as-is
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return response;
    }
    
    // For JSON responses, parse safely
    const data = await safeJsonParse(response);
    
    return {
      ...response,
      data,
      json: () => Promise.resolve(data)
    };
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
}
