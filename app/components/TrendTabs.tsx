import React from "react";

interface TrendTabsProps {
  engines: string[];
  periods: string[];
  selectedEngine: string;
  selectedPeriod: string;
  onEngineChange: (engine: string) => void;
  onPeriodChange: (period: string) => void;
}

const TrendTabs: React.FC<TrendTabsProps> = ({
  engines,
  periods,
  selectedEngine,
  selectedPeriod,
  onEngineChange,
  onPeriodChange,
}) => {
  return (
    <div className="w-full mb-4">
      <div className="flex gap-2 mb-2">
        {engines.map((engine) => (
          <button
            key={engine}
            className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors ${selectedEngine === engine ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            onClick={() => onEngineChange(engine)}
          >
            {engine}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period}
            className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors ${selectedPeriod === period ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
            onClick={() => onPeriodChange(period)}
          >
            {period}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendTabs; 