import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function App() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [file, setFile] = useState(null);
    const [copied, setCopied] = useState(false);

    // ✅ Backend URL Environment Variable Se Lo (Better Practice)
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://ai-tool-backend.onrender.com";

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setResponse("");
        
        try {
            const res = await fetch(`${BACKEND_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();
            setResponse("");

            // ✅ Typing Effect Optimization
            let index = 0;
            const interval = setInterval(() => {
                setResponse((prev) => prev + data.result[index]);
                index++;
                if (index >= data.result.length) clearInterval(interval);
            }, 30);

            setCopied(false);
            setPrompt(""); // ✅ Generate Click Hone Par Prompt Clear Karo
        } catch (error) {
            console.error("Error:", error);
            setResponse("❌ Error fetching response. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ File Upload Function
    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
            console.log("File Uploaded:", uploadedFile.name);
        }
    };

    // ✅ PDF Export Function
    const exportToPDF = () => {
        const input = document.getElementById("response-box");
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            pdf.addImage(imgData, "PNG", 10, 10, 180, 160);
            pdf.save("AI_Response.pdf");
        });
    };

    // ✅ Copy to Clipboard Function
    const handleCopy = () => {
        navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} flex flex-col items-center p-6 transition-all duration-300`}>
            {/* ✅ Dark Mode Toggle Button */}
            <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="absolute top-4 right-4 px-4 py-2 bg-gray-800 text-white rounded shadow hover:bg-gray-700 transition-all"
            >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <h1 className="text-3xl font-bold mb-6">✨ AI Content Generator ✨</h1>

            <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Enter your prompt..." 
                className="w-full max-w-lg p-3 border rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
            />

            <button 
                onClick={handleGenerate} 
                className={`mt-4 px-6 py-2 text-white font-bold rounded shadow transition-all ${
                    loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`} 
                disabled={loading}
            >
                {loading ? "⏳ Generating..." : "🚀 Generate"}
            </button>

            {/* ✅ File Upload Input */}
            <div className="mt-4">
                <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="p-2 border rounded shadow"/>
                {file && <p className="mt-2 text-green-600">📂 {file.name} uploaded!</p>}
            </div>

            <h3 className="text-xl font-semibold mt-6">🔍 AI Response:</h3>
            <div id="response-box" className="w-full max-w-lg bg-white p-4 rounded shadow min-h-[100px] border relative transition-all">
                {response ? (
                    <>
                        <p className="whitespace-pre-wrap">{response}</p>
                        {/* ✅ Copy Button */}
                        <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-all">
                            {copied ? "✅ Copied!" : "📋 Copy"}
                        </button>
                    </>
                ) : (
                    <p className="text-gray-400 italic">{loading ? "⏳ Please wait..." : "Your AI-generated content will appear here..."}</p>
                )}
            </div>

            {/* ✅ PDF Export Button */}
            {response && (
                <button onClick={exportToPDF} className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all">
                    📄 Export to PDF
                </button>
            )}
        </div>
    );
}

export default App;
