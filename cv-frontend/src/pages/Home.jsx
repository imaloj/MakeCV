import { useState } from "react";
import { useCV } from "../hooks/useCV.js";
import Header from "../components/Header.jsx";
import FileUploader from "../components/FileUploader.jsx";
import JobDescriptionInput from "../components/JobDescriptionInput.jsx";
import CustomizationOptions from "../components/CustomizationOptions.jsx";
import ProgressIndicator from "../components/ProgressIndicator.jsx";
import ResultViewer from "../components/ResultViewer.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";

const DEFAULT_OPTIONS = {
  strategy: "smart-match",
  outputFormat: "docx",
  preserveOriginal: true,
  highlightChanges: true,
};

export default function Home() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [localError,setLocalError]=useState(null);

  const {
    isLoading,
    error,
    progress,
    result,
    parsedFile,
    uploadFile,
    customize,
    reset,
  } = useCV();

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    try {
      await uploadFile(selectedFile);
    } catch {
      //error handle in hook
    }
  };
  const handleClear = () => {
    setFile(null);
    setJobDescription("");
    setOptions(DEFAULT_OPTIONS);
    reset();
  };

  const handleCustomize = async () => {
    setLocalError(null);

    if (!file){
      alert('Please upload your CV first.');
      return;
    }
    if(!jobDescription.trim()){
      alert("Please enter a job description.");
      return;
    }
    if(jobDescription.trim().length<10){
      alert("Job Description must be at least 10 characters.");
      return;
    }
    try{
      await customize(file,jobDescription,options);
    }catch{
      //already handled in hook
    }
  };
  const canSubmit = !isLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Error */}
        {(error || localError)&&( <ErrorMessage message={error||localError} onDismiss={() =>setLocalError(null)}
        />
        )}

        {/*Progress */}
        {progress && <ProgressIndicator progress={progress} />}

        {/*result */}
        {result && <ResultViewer result={result} onReset={handleClear} />}

        {/*main form*/}
        {!result && (
          <div className="space-y-6">
            <div className="card">
              <FileUploader
                file={file}
                onFileSelect={handleFileSelect}
                parsedData={parsedFile}
                onClear={handleClear}
              />
            </div>
            
            {file && (
              <div className="card animate-slide-up">
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  error={error?.includes("description") ? error : null}
                />
              </div>
            )}
            {file && jobDescription.length >= 10 && (
              <div className="card animate-slide-up">
                <CustomizationOptions options={options} onChange={setOptions} />
              </div>
            )}
            {/*Submit Button */}
            {file && (
              <div className="flex justify-end">
                <button
                  onClick={handleCustomize}
                  disabled={!canSubmit}
                  className={`inline-flex items-center rounded-4xl px-4 py-2 gap-2 text-sm font-semibold transition-all duration-200
                  ${isLoading
                    ?'bg-white text-indigo-600 border border-indigo-600'
                :'bg-indigo-600 text-white hover:bg-indigo-500'
            }
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
            >
                  {isLoading ? (
                    <>
                      <svg
                        aria-hidden="true"
                        role="status"
                        className=" w-4 h-4 animate-spin text-indigo-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
                          fill="#E5E7EB"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentColor"
                        />
                      </svg>

                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Customize My CV</span>

                      <svg
                        className="ml-2 h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
        {/*Info footer*/}
        {!result && (
          <div className="text-center text-xs text-gray-400 py-4">
            <p>
              {" "}
              Your data is processed securely and never stored permanently.
            </p>
            <p className="mt-1">
              Supported formats:PDF, DOCX,TXT • Max file size: 25MB
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
