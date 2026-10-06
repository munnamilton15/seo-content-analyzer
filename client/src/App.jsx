import { useState } from "react";
import "./App.css";
function getScoreStatus(score) {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 50) {
    return "Needs Improvement";
  }

  return "Poor";
}
function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Analysis failed."
        );
      }

      setAnalysis(result.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* Navbar */}

      <nav className="navbar">
        <div className="logo">
          SEO<span>Analyzer</span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* Hero */}

      <main>
        <section className="hero">

          <div className="badge">
            🚀 Smart SEO Analysis
          </div>

          <h1>
            Analyze Your Website's
            <span> SEO Performance</span>
          </h1>

          <p className="hero-description">
            Get a detailed SEO analysis of your webpage
            including keywords, content quality, technical
            SEO, headings, images, links, and actionable
            recommendations.
          </p>

          {/* URL Input */}

          <div className="url-box">

            <input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAnalyze();
                }
              }}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                "Analyze SEO"
              )}
            </button>

          </div>

          <p className="privacy-text">
            🔒 We analyze publicly available webpage content.
          </p>
          {loading && (
            <p className="analysis-status">
              🔍 Checking SEO, content, links, and PageSpeed...
            </p>
          )}
          {/* Error */}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>

              <div>
                <strong>Analysis failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Results */}

          {analysis && (
            <div className="analysis-preview">

              <h2>
                SEO Analysis Results
              </h2>

              <div className="score-container">
                <div className="score">
                  {analysis.score}
                  <span>/100</span>
                </div>

                <div className="score-status">
                  {getScoreStatus(analysis.score)}
                </div>
              </div>
              <div className="score-breakdown">

                <div className="score-item">
                  <span>Technical SEO</span>
                  <strong>
                    {analysis.scores.technical}/20
                  </strong>
                </div>

                <div className="score-item">
                  <span>On-Page SEO</span>
                  <strong>
                    {analysis.scores.onPage}/20
                  </strong>
                </div>

                <div className="score-item">
                  <span>Content Quality</span>
                  <strong>
                    {analysis.scores.content}/20
                  </strong>
                </div>

                <div className="score-item">
                  <span>Keywords</span>
                  <strong>
                    {analysis.scores.keywords}/20
                  </strong>
                </div>

                <div className="score-item">
                  <span>Images</span>
                  <strong>
                    {analysis.scores.images}/5
                  </strong>
                </div>

                <div className="score-item">
                  <span>Security</span>
                  <strong>
                    {analysis.scores.security}/5
                  </strong>
                </div>

              </div>

              <p className="analyzed-url">
                {analysis.url}
              </p>

              {/* Quick Stats */}

              <div className="quick-results">

                <div>
                  <strong>
                    {analysis.content.wordCount}
                  </strong>
                  <span>
                    Words
                  </span>
                </div>

                <div>
                  <strong>
                    {analysis.headings.h1Count}
                  </strong>
                  <span>
                    H1
                  </span>
                </div>

                <div>
                  <strong>
                    {analysis.headings.h2Count}
                  </strong>
                  <span>
                    H2
                  </span>
                </div>

                <div>
                  <strong>
                    {analysis.images.total}
                  </strong>
                  <span>
                    Images
                  </span>
                </div>

                <div>
                  <strong>
                    {analysis.links.internal}
                  </strong>
                  <span>
                    Internal Links
                  </span>
                </div>

                <div>
                  <strong>
                    {analysis.links.external}
                  </strong>
                  <span>
                    External Links
                  </span>
                </div>

              </div>
              {/* Keyword Analysis */}

              <div className="result-card">

                <h3>
                  🔑 Keyword Analysis
                </h3>

                {analysis.keywords.keywords.length === 0 ? (
                  <p>
                    No significant keywords found.
                  </p>
                ) : (
                  <div className="keyword-table">

                    <div className="keyword-header">
                      <span>Keyword</span>
                      <span>Count</span>
                      <span>Density</span>
                    </div>

                    {analysis.keywords.keywords
                      .slice(0, 10)
                      .map((keyword, index) => (
                        <div
                          className="keyword-row"
                          key={index}
                        >
                          <strong>
                            {keyword.keyword}
                          </strong>

                          <span>
                            {keyword.count}
                          </span>

                          <span>
                            {keyword.density}%
                          </span>
                        </div>
                      ))}

                  </div>
                )}

              </div>
              {/* Title */}

              <div className="result-card">

                <h3>
                  🏷️ Title
                </h3>

                <p>
                  {analysis.title.text ||
                    "No title found"}
                </p>

                <small>
                  {analysis.title.length} characters
                </small>

              </div>

              {/* Meta Description */}

              <div className="result-card">

                <h3>
                  📝 Meta Description
                </h3>

                <p>
                  {analysis.metaDescription.text ||
                    "No meta description found"}
                </p>

                <small>
                  {analysis.metaDescription.length} characters
                </small>

              </div>

              {/* Readability */}

              <div className="result-card">
                {/* Link Health */}

                <div className="result-card">

                  <h3>🔗 Link Health</h3>

                  <div className="link-health-grid">

                    <div>
                      <strong>{analysis.links.checker.total}</strong>
                      <span>Checked</span>
                    </div>

                    <div>
                      <strong>{analysis.links.checker.working}</strong>
                      <span>Working</span>
                    </div>

                    <div>
                      <strong>{analysis.links.checker.redirected}</strong>
                      <span>Redirected</span>
                    </div>

                    <div>
                      <strong>{analysis.links.checker.broken}</strong>
                      <span>Broken</span>
                    </div>

                  </div>

                  {analysis.links.checker.broken > 0 && (
                    <div className="broken-links">

                      <h4>Broken Links</h4>

                      {analysis.links.checker.results
                        .filter((link) => link.broken)
                        .map((link, index) => (
                          <div className="broken-link" key={index}>

                            <strong>✗ {link.status || "Failed"}</strong>

                            <span>{link.url}</span>

                          </div>
                        ))}

                    </div>
                  )}

                </div>
                <h3>
                  📖 Readability Analysis
                </h3>

                <div className="readability-score">
                  <strong>
                    {analysis.content.readability.score}
                  </strong>

                  <span>
                    /100
                  </span>
                </div>

                <div className="readability-grid">

                  <div>
                    <strong>
                      {analysis.content.readability.words}
                    </strong>
                    <span>
                      Words
                    </span>
                  </div>

                  <div>
                    <strong>
                      {analysis.content.readability.sentences}
                    </strong>
                    <span>
                      Sentences
                    </span>
                  </div>

                  <div>
                    <strong>
                      {analysis.content.readability.paragraphs}
                    </strong>
                    <span>
                      Paragraphs
                    </span>
                  </div>

                  <div>
                    <strong>
                      {analysis.content.readability.averageSentenceLength}
                    </strong>
                    <span>
                      Avg. Sentence Words
                    </span>
                  </div>

                </div>

              </div>
             {/* PageSpeed */}

<div className="result-card pagespeed-card">

  <div className="card-heading">
    <h3>🚀 PageSpeed Performance</h3>
    <span>Mobile</span>
  </div>

  {analysis.pageSpeed.available === false ? (

    <div className="pagespeed-unavailable">

      <strong>⚠️ PageSpeed Unavailable</strong>

      <p>
        PageSpeed data is currently unavailable.
        The rest of your SEO analysis is still available.
      </p>

    </div>

  ) : (

    <>

      <div className="pagespeed-scores">

        <div className="pagespeed-score">

          <strong>
            {analysis.pageSpeed.performance}
          </strong>

          <span>
            Performance
          </span>

        </div>

        <div className="pagespeed-score">

          <strong>
            {analysis.pageSpeed.accessibility}
          </strong>

          <span>
            Accessibility
          </span>

        </div>

        <div className="pagespeed-score">

          <strong>
            {analysis.pageSpeed.bestPractices}
          </strong>

          <span>
            Best Practices
          </span>

        </div>

        <div className="pagespeed-score">

          <strong>
            {analysis.pageSpeed.seo}
          </strong>

          <span>
            SEO
          </span>

        </div>

      </div>


      <div className="core-vitals">

        <h4>
          Core Web Vitals & Performance Metrics
        </h4>

        <div className="metrics-grid">

          <div className="metric">

            <strong>
              {analysis.pageSpeed.metrics.firstContentfulPaint}
            </strong>

            <span>
              First Contentful Paint
            </span>

          </div>


          <div className="metric">

            <strong>
              {analysis.pageSpeed.metrics.largestContentfulPaint}
            </strong>

            <span>
              Largest Contentful Paint
            </span>

          </div>


          <div className="metric">

            <strong>
              {analysis.pageSpeed.metrics.speedIndex}
            </strong>

            <span>
              Speed Index
            </span>

          </div>


          <div className="metric">

            <strong>
              {analysis.pageSpeed.metrics.totalBlockingTime}
            </strong>

            <span>
              Total Blocking Time
            </span>

          </div>


          <div className="metric">

            <strong>
              {analysis.pageSpeed.metrics.cumulativeLayoutShift}
            </strong>

            <span>
              Cumulative Layout Shift
            </span>

          </div>

        </div>

      </div>

    </>

  )}

</div>

{/* Technical */}
                {/* Technical */}

                <div className="result-card">
                  <h3>⚙️ Technical SEO</h3>

                  <div className="technical-list">

                    <div className="technical-item">
                      <span>HTTPS</span>
                      <strong className={analysis.technical.httpsEnabled ? "status-good" : "status-bad"}>
                        {analysis.technical.httpsEnabled ? "✓ Enabled" : "✗ Not Enabled"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>Canonical URL</span>
                      <strong className={analysis.technical.canonical ? "status-good" : "status-bad"}>
                        {analysis.technical.canonical ? "✓ Found" : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>robots.txt</span>
                      <strong className={analysis.technical.robotsTxt ? "status-good" : "status-bad"}>
                        {analysis.technical.robotsTxt ? "✓ Found" : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>XML Sitemap</span>
                      <strong className={analysis.technical.sitemap ? "status-good" : "status-bad"}>
                        {analysis.technical.sitemap ? "✓ Found" : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>Viewport</span>
                      <strong className={analysis.technical.viewport ? "status-good" : "status-bad"}>
                        {analysis.technical.viewport ? "✓ Found" : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>Language</span>
                      <strong className={analysis.technical.language ? "status-good" : "status-bad"}>
                        {analysis.technical.language
                          ? `✓ ${analysis.technical.language}`
                          : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>Open Graph</span>
                      <strong
                        className={
                          analysis.technical.openGraph.title &&
                            analysis.technical.openGraph.description
                            ? "status-good"
                            : "status-bad"
                        }
                      >
                        {analysis.technical.openGraph.title &&
                          analysis.technical.openGraph.description
                          ? "✓ Configured"
                          : "✗ Missing"}
                      </strong>
                    </div>

                    <div className="technical-item">
                      <span>Structured Data</span>
                      <strong
                        className={
                          analysis.technical.structuredData
                            ? "status-good"
                            : "status-bad"
                        }
                      >
                        {analysis.technical.structuredData
                          ? "✓ Detected"
                          : "✗ Not Detected"}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* Issues */}

                <div className="issues-section">

                  <h3>
                    🔍 Issues Found
                  </h3>

                  {analysis.issues.length === 0 ? (
                    <p className="no-issues">
                      🎉 No major issues found!
                    </p>
                  ) : (
                    <div className="issues">

                      {analysis.issues.map(
                        (issue, index) => (
                          <div
                            className={`issue ${issue.type}`}
                            key={index}
                          >
                            <strong>
                              {issue.category}
                            </strong>

                            <p>
                              {issue.message}
                            </p>

                            {issue.recommendation && (
                              <div className="issue-recommendation">
                                <strong>💡 Recommendation</strong>

                                <p>
                                  {issue.recommendation}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>
          )}

            </section>

        {/* Features */}

          <section
            id="features"
            className="features-section"
          >

            <h2>
              What We Analyze
            </h2>

            <p className="section-description">
              Our analyzer checks important on-page
              and technical SEO factors.
            </p>

            <div className="features-grid">

              <div className="feature-card">
                <div className="feature-icon">
                  🔑
                </div>
                <h3>Keywords</h3>
                <p>
                  Analyze keyword usage, frequency
                  and keyword density.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  🏷️
                </div>
                <h3>Meta Tags</h3>
                <p>
                  Check title tags, meta descriptions
                  and canonical URLs.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  📑
                </div>
                <h3>Content</h3>
                <p>
                  Analyze word count, headings,
                  paragraphs and readability.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  🖼️
                </div>
                <h3>Images</h3>
                <p>
                  Find images with missing or
                  incomplete alt text.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  🔗
                </div>
                <h3>Links</h3>
                <p>
                  Analyze internal and external
                  links on your webpage.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  ⚙️
                </div>
                <h3>Technical SEO</h3>
                <p>
                  Check HTTPS, canonical,
                  robots and other technical factors.
                </p>
              </div>

            </div>

          </section>

          {/* How it works */}

          <section
            id="how-it-works"
            className="how-section"
          >

            <h2>
              How It Works
            </h2>

            <div className="steps">

              <div className="step">
                <div className="step-number">
                  1
                </div>

                <h3>
                  Enter URL
                </h3>

                <p>
                  Enter the webpage you want to analyze.
                </p>
              </div>

              <div className="step">
                <div className="step-number">
                  2
                </div>

                <h3>
                  Analyze
                </h3>

                <p>
                  Our SEO engine analyzes the webpage.
                </p>
              </div>

              <div className="step">
                <div className="step-number">
                  3
                </div>

                <h3>
                  Get Results
                </h3>

                <p>
                  View your SEO score and improvement
                  suggestions.
                </p>
              </div>

            </div>

          </section>

      </main>

      <footer id="about">
        <p>
          © 2026 SEO Analyzer. Built for smarter
          content optimization.
        </p>
      </footer>

    </div>
  );
}

export default App;