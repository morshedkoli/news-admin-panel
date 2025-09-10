export default function Settings() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your news application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Site Name</span>
              <span className="text-sm font-medium">News Admin</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Environment</span>
              <span className="text-sm font-medium">Development</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Firebase Integration</span>
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auto Notifications</span>
              <span className="text-sm font-medium text-green-600">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cloudinary Storage</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}