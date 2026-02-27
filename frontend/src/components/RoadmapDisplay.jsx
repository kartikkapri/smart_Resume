import jsPDF from 'jspdf'

const RoadmapDisplay = ({ roadmap, targetRole }) => {
  const exportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text(`Learning Roadmap - ${targetRole}`, 20, 20)
    
    let y = 40
    roadmap.forEach((week) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(14)
      doc.text(`Week ${week.week}: ${week.topic}`, 20, y)
      y += 10
      doc.setFontSize(10)
      doc.text(`Skills: ${week.skills.join(', ')}`, 20, y)
      y += 8
      week.resources.forEach((res) => {
        doc.text(`- ${res.title}`, 25, y)
        y += 6
      })
      y += 5
    })
    
    doc.save('learning-roadmap.pdf')
  }

  return (
    <div className="mt-8 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your Learning Roadmap
        </h2>
        <button
          onClick={exportPDF}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          📄 Export PDF
        </button>
      </div>

      <div className="grid gap-6">
        {roadmap.map((week, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                {week.week}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{week.topic}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {week.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-600">Resources:</h4>
              {week.resources.map((resource, i) => (
                <a
                  key={i}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 group-hover:text-blue-600 transition-colors font-medium">
                      {resource.title}
                    </span>
                    <span className="text-blue-500 group-hover:text-blue-700 transition-colors">
                      🔗
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoadmapDisplay
