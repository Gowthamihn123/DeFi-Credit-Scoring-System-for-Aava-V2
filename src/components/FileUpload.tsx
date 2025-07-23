import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!Array.isArray(data)) {
        throw new Error('JSON file must contain an array of transactions');
      }

      if (data.length === 0) {
        throw new Error('JSON file is empty');
      }

      // Validate transaction structure
      const requiredFields = ['wallet_address', 'action', 'amount', 'timestamp'];
      const firstTransaction = data[0];
      const missingFields = requiredFields.filter(field => !(field in firstTransaction));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      onFileUpload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON file');
    } finally {
      setIsLoading(false);
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      handleFile(jsonFile);
    } else {
      setError('Please upload a JSON file');
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Processing file...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Upload Transaction Data
              </h3>
              <p className="text-slate-600">
                Drag and drop your Aave V2 transaction JSON file here, or click to browse
              </p>
            </div>

            <div className="space-y-2">
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="sr-only"
                />
                <span className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl">
                  <FileText className="w-4 h-4" />
                  <span>Choose JSON File</span>
                </span>
              </label>
            </div>

            <div className="text-sm text-slate-500 space-y-1">
              <p>Expected format: Array of transaction objects</p>
              <p>Required fields: wallet_address, action, amount, timestamp</p>
              <p>Supported actions: deposit, borrow, repay, redeemunderlying, liquidationcall</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
      </div>

      {/* Sample Data Format */}
      <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-3">Sample Data Format</h4>
        <pre className="text-sm text-slate-600 overflow-x-auto">
{`[
  {
    "wallet_address": "0x1234...5678",
    "action": "deposit",
    "amount": 1000.0,
    "asset": "USDC",
    "timestamp": "2023-01-15T10:30:00Z",
    "gas_used": 45000,
    "gas_price": 20000000000
  },
  {
    "wallet_address": "0x1234...5678",
    "action": "borrow",
    "amount": 500.0,
    "asset": "DAI",
    "timestamp": "2023-01-15T11:00:00Z"
  }
]`}
        </pre>
      </div>
    </div>
  );
}