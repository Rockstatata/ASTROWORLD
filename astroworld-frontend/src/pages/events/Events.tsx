import Layout from '../../components/Layout'

const Events = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Events
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Astronomical events and observations coming soon!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Events