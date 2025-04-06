export function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="bg-light dark:bg-dark p-6 rounded-lg border-2 border-slate-200 dark:border-slate-800">
          <p className="text-lg mb-4">Welcome to your profile!</p>
          <p className="text-gray-600 dark:text-gray-400">
            This is a protected page that only authenticated users can access.
          </p>
        </div>
      </div>
    </div>
  );
}
