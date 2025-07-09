import app from './app';

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PulseMates API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/ping`);
  console.log(`🔗 API docs: http://localhost:${PORT}/api/health`);
});
