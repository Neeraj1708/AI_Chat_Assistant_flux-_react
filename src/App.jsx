import { useEffect, useRef, useState } from 'react';
import './App.css';
import { URL } from './constants';
import RecentSearch from './components/RecentSearch';
import QuestionAnswer from './components/QuestionAnswer';

function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState([]);
  const [recentHistory, setRecentHistory] = useState(
    JSON.parse(localStorage.getItem('history')) || []
  );
  const [selectedHistory, setSelectedHistory] = useState('');
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState('dark');

  const scrollToAns = useRef(null);
  const bottomRef = useRef(null);

  const askQuestion = async () => {
    if (loader) return;
    if (!question && !selectedHistory) return;

    setError('');

    if (question) {
      let history = JSON.parse(localStorage.getItem('history')) || [];
      history = [question, ...history];
      localStorage.setItem('history', JSON.stringify(history));
      setRecentHistory(history);
    }

    const payloadData = question || selectedHistory;

    const payload = {
      contents: [
        {
          parts: [{ text: payloadData }],
        },
      ],
    };

    try {
      setLoader(true);

      let response = await fetch(URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // ✅ FIX STARTS HERE: Handle 429 errors specifically
      if (response.status === 429) {
        throw new Error('⏳ You are chatting too fast! Please wait 1-2 minutes.');
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      // ✅ FIX ENDS HERE

      response = await response.json();

      let dataString = response.candidates[0].content.parts[0].text;
      dataString = dataString.split('* ').map((item) => item.trim());

      setResult((prev) => [
        ...prev,
        { type: 'q', text: payloadData },
        { type: 'a', text: dataString },
      ]);

      setQuestion('');
      setSelectedHistory('');

      requestAnimationFrame(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        } else if (scrollToAns.current) {
          scrollToAns.current.scrollTop = scrollToAns.current.scrollHeight;
        }
      });
    } catch (err) {
      console.error(err);
      // Show the specific error message to the user
      setError(err.message || 'Something went wrong while fetching the answer.');
    } finally {
      setLoader(false);
    }
  };

  const isEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  useEffect(() => {
    if (selectedHistory.trim()) {
      askQuestion();
    }
      
  }, [selectedHistory]);

  useEffect(() => {
    if (darkMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleClearConversation = () => {
    setResult([]);
    setError('');
  };

  const handleClearHistory = () => {
    localStorage.removeItem('history');
    setRecentHistory([]);
    setSelectedHistory('');
  };

  return (
    <div className={darkMode === 'dark' ? 'dark' : ''}>
      {/* full viewport app */}
      <div className="h-screen flex overflow-hidden bg-slate-100 text-slate-900 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-200 bg-white/80 backdrop-blur-xl flex flex-col min-h-0 dark:border-slate-800/80 dark:bg-slate-950/80">
        
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-500 text-xs font-bold shadow-lg text-white">
                AI
              </span>
              <div>
                <h1 className="text-sm font-semibold leading-tight">
                  Flux AI
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                 @ Build by Neeraj
                </p>
              </div>
            </div>
          </div>

          {/* Recent searches */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-700 uppercase tracking-[0.18em] dark:text-slate-200">
                Recent
              </h2>
              <p className="text-[11px] text-slate-500 mt-1">
                Click any query to reuse it
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-[11px] px-2 py-1 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/80"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <RecentSearch
              recentHistory={recentHistory}
              setRecentHistory={setRecentHistory}
              setSelectedHistory={setSelectedHistory}
            />
          </div>

          {/* Theme selector & status */}
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between gap-3">
              <div className="w-32">
                <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                  Theme
                </label>
                <select
                  onChange={(e) => setDarkMode(e.target.value)}
                  value={darkMode}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-fuchsia-500 dark:bg-slate-900 dark:border-slate-700"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 mb-1">
                  Model status
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-700/70 dark:text-emerald-300">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Top bar */}
          <div className="border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-[0.25em] text-fuchsia-500 dark:text-fuchsia-400">
                  Flux AI · Build by Neeraj

                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ask about code, debugging, or learning concepts.
                </span>
              
                
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="w-full max-w-4xl mx-auto flex-1 min-h-0 flex flex-col px-4 md:px-8 pt-6 pb-4">
            {/* Heading + actions */}
            <header className="mb-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500">
                    Hey, what are we building today?
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 max-w-xl dark:text-slate-400">
                    Explain concepts, generate code, or ask for step-by-step help.
                    I’ll try to answer like a friendly senior dev.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearConversation}
                    className="px-4 py-2 text-[11px] font-medium rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 shadow-sm transition dark:border-slate-700/80 dark:bg-slate-950/70 dark:hover:bg-slate-800/80 dark:text-slate-200"
                  >
                    Clear chat
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-3 text-xs md:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800/60">
                  {error}
                </div>
              )}
            </header>

            {/* Loader */}
            {loader && (
              <div className="flex justify-center mb-3">
                <div
                  role="status"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm dark:bg-slate-950/80 dark:border-slate-700/70 shadow-fuchsia-500/10"
                >
                  <svg
                    aria-hidden="true"
                    className="inline w-4 h-4 text-slate-400 animate-spin fill-fuchsia-500"
                    viewBox="0 0 100 101"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="text-[11px] text-slate-500 dark:text-slate-300">
                    Thinking…
                  </span>
                </div>
              </div>
            )}

            {/* Answer area */}
            <section
              ref={scrollToAns}
              className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-[0_0_30px_rgba(15,23,42,0.08)] p-4 md:p-6 overflow-y-auto answer-area dark:border-slate-800/90 dark:bg-slate-950/80 dark:shadow-[0_0_60px_rgba(15,23,42,0.9)]"
            >
              {result.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Start by asking a question below.
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm dark:text-slate-500">
                    For example: “Explain this bug to me”, or “Teach me Java from
                    zero”.
                  </p>
                </div>
              ) : (
                <ul className="space-y-4 text-left">
                  {result.map((item, index) => (
                    <QuestionAnswer key={index} item={item} index={index} />
                  ))}
                  <div ref={bottomRef} />
                </ul>
              )}
            </section>

            {/* Input bar */}
            <footer className="mt-4">
              <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 flex flex-col gap-2 shadow-sm dark:bg-slate-950/90 dark:border-slate-800 dark:shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 dark:text-slate-500">
                 
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={question}
                    onKeyDown={isEnter}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-transparent h-10 px-1 outline-none text-sm md:text-base placeholder:text-slate-400 text-slate-900 dark:placeholder:text-slate-600 dark:text-slate-100"
                    placeholder="Ask me anything about code, errors, or concepts..."
                  />
                  <button
                    onClick={askQuestion}
                    disabled={loader || (!question && !selectedHistory)}
                    className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 text-xs md:text-sm font-medium text-white hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-fuchsia-500/30"
                  >
                    Ask
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-500 text-center dark:text-slate-500">
                Answers may be inaccurate. Review the code before using.
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;