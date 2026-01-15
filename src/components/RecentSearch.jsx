
function RecentSearch({recentHistory, setRecentHistory, setSelectedHistory}) {
      
  const clearHistory = () => {
    localStorage.clear();
    setRecentHistory([])
  }
 
    return (
        <>
            <div >
                 
                <ul className='text-left overflow-auto mt-2'>
                    {
                        recentHistory && recentHistory.map((item, index) => (
                            <li key={index} onClick={() => setSelectedHistory(item)} className=' pl-3 px-5 truncate dark:text-zinc-400 text-zinc-700 cursor-pointer dark:hover:bg-zinc-700 dark:hover:text-zinc-100 hover:bg-red-200 hover:text-zinc-800'>{item}</li>
                        ))
                    }
                </ul>
            </div>
        </>
    )
}

export default RecentSearch;