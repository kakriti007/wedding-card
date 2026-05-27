export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6 text-center">
          <div className="text-6xl">📧</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Check your email
          </h1>
          <p className="text-gray-600">
            A sign in link has been sent to your email address. Click the link
            in the email to sign in.
          </p>
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              You can close this window and check your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
