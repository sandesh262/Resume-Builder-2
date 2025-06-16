import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  FileText, 
  ArrowLeft, 
  Eye,
  Check,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Trash2,
  Search,
  Calendar
} from 'lucide-react';

const HistoryPage = () => {
  const { analysisHistory, loading, deleteAnalysis } = useAnalysis();
  const navigate = useNavigate();
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  const getDisplayName = (filename) => {
    if (!filename) return 'Resume Analysis';
    return filename.replace(/\.(pdf|PDF|docx|DOCX)$/, '');
  };

  const handleDeleteClick = (e, analysisId) => {
    e.stopPropagation();
    setDeleteConfirm(analysisId);
  };

  const confirmDelete = async (analysisId) => {
    try {
      await deleteAnalysis(analysisId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting analysis:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const filteredAndSortedHistory = analysisHistory
    ?.filter(analysis => {
      const matchesSearch = !searchTerm || 
        getDisplayName(analysis.filename || analysis.originalname).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (analysis.jobTitle && analysis.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === 'all' || 
        (filterType === 'high' && analysis.score >= 70) ||
        (filterType === 'medium' && analysis.score >= 40 && analysis.score < 70) ||
        (filterType === 'low' && analysis.score < 40);
      
      return matchesSearch && matchesFilter;
    })
    ?.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'score-high':
          return (b.score || 0) - (a.score || 0);
        case 'score-low':
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 70) return <CheckCircle className="h-4 w-4" />;
    if (score >= 40) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  useEffect(() => {
    console.log('Fetching analysis history...');
  }, []);

  const handleAnalysisClick = (analysis) => {
    setSelectedAnalysis(analysis);
  };

  const handleCloseAnalysis = () => {
    setSelectedAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Analysis History
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track your progress and view previous resume analyses with detailed insights
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by filename or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
                >
                  <option value="all">All Scores</option>
                  <option value="high">High (70%+)</option>
                  <option value="medium">Medium (40-69%)</option>
                  <option value="low">Low (40%)</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score-high">Highest Score</option>
                  <option value="score-low">Lowest Score</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                    <Trash2 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Delete Analysis
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Are you sure you want to delete this analysis? This action cannot be undone.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={cancelDelete}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmDelete(deleteConfirm)}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Detail Modal */}
        <AnimatePresence>
          {selectedAnalysis && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
            >
              <div className="fixed inset-0 flex flex-col justify-start items-center p-4 sm:p-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-y-auto shadow-2xl"
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 z-10 rounded-t-2xl">
                    <div className="flex justify-between items-center px-8 py-6">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Analysis Details</h2>
                        <p className="text-lg text-gray-600 mt-2">
                          {selectedAnalysis.filename && (
                            <span className="font-medium text-gray-800">
                              {getDisplayName(selectedAnalysis.filename)} • 
                            </span>
                          )}
                          {new Date(selectedAnalysis.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={handleCloseAnalysis}
                        className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <ArrowLeft className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                  </div>

                  <div className="px-8 py-8 space-y-8">
                    {/* Score Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="p-6 bg-white rounded-2xl shadow-lg">
                            <span className="text-4xl font-bold text-blue-600">
                              {selectedAnalysis.score}%
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900">Overall Match Score</h3>
                            <p className="text-lg text-gray-600 mt-1">Based on job requirements</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm">
                          <Eye className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600 font-medium">Detailed Analysis</span>
                        </div>
                      </div>
                      {selectedAnalysis.overview && (
                        <div className="mt-6 p-4 bg-white rounded-xl">
                          <p className="text-gray-700 leading-relaxed">{selectedAnalysis.overview}</p>
                        </div>
                      )}
                    </motion.div>

                    {/* Strengths Section */}
                    {selectedAnalysis.strengths && selectedAnalysis.strengths.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                      >
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-green-100 rounded-xl mr-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-900">Strengths</h3>
                        </div>
                        <div className="space-y-4">
                          {selectedAnalysis.strengths.map((strength, idx) => (
                            <div key={idx} className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 leading-relaxed">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Improvement Areas Section */}
                    {selectedAnalysis.improvement_areas && selectedAnalysis.improvement_areas.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                      >
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-yellow-100 rounded-xl mr-4">
                            <Lightbulb className="h-6 w-6 text-yellow-600" />
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-900">Areas for Improvement</h3>
                        </div>
                        <div className="space-y-4">
                          {selectedAnalysis.improvement_areas.map((area, idx) => (
                            <div key={idx} className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 leading-relaxed">{area}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* General Feedback Section */}
                    {selectedAnalysis.general_feedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                      >
                        <div className="flex items-center mb-6">
                          <div className="p-3 bg-blue-100 rounded-xl mr-4">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-semibold text-gray-900">General Feedback</h3>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                          <p className="text-gray-700 leading-relaxed text-lg">{selectedAnalysis.general_feedback}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History List */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="w-48 h-6 bg-gray-200 rounded"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedHistory?.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {filteredAndSortedHistory.length} of {analysisHistory?.length || 0} analyses
                </p>
              </div>
              
              <AnimatePresence>
                {filteredAndSortedHistory.map((analysis, index) => (
                  <motion.div
                    key={analysis.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 overflow-hidden"
                  >
                    <div className="p-8" onClick={() => handleAnalysisClick(analysis)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-8 w-8 text-blue-600" />
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {getDisplayName(analysis.filename || analysis.originalname || 'Resume Analysis')}
                            </h3>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(analysis.timestamp).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            {analysis.jobTitle && analysis.jobTitle !== 'No job title' && (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                                <span className="truncate max-w-[300px]">Job: {analysis.jobTitle}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getScoreColor(analysis.score)}`}>
                            {getScoreIcon(analysis.score)}
                            <span className="font-bold text-lg">
                              {analysis.score ? `${Math.round(analysis.score)}%` : 'N/A'}
                            </span>
                          </div>
                          
                          <button
                            onClick={(e) => handleDeleteClick(e, analysis.id)}
                            className="p-3 rounded-full hover:bg-red-50 transition-colors group/delete opacity-0 group-hover:opacity-100"
                            title="Delete analysis"
                          >
                            <Trash2 className="h-5 w-5 text-red-500 group-hover/delete:text-red-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 mb-8">
                  <Clock className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || filterType !== 'all' ? 'No Matching Results' : 'No Analysis History Yet'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                    : 'Your resume analysis history will appear here once you start analyzing resumes.'
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  {(searchTerm || filterType !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg inline-flex items-center"
                  >
                    <FileText className="mr-3 h-5 w-5" />
                    Start New Analysis
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;