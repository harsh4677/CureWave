/** @format */
"use client";

import axios from "axios";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { loadingCityAtom, placeAtom } from "./atom";
import { IoSearch } from "react-icons/io5";
import { MdOutlineLocationOn, MdMyLocation } from "react-icons/md";
import Link from "next/link";
import { WiDaySunny, WiRain, WiCloudy, WiSnow, WiThunderstorm, WiFog } from "react-icons/wi";
import { FiDroplet, FiWind, FiThermometer } from "react-icons/fi";
import { BsCalendarDate, BsClipboard2Pulse, BsDropletHalf } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

interface DiseaseRecord {
  Month: string;
  monthNumber: number;
  Date: number;
  tempMin: number;
  tempAvg: number;
  tempMax: number;
  humidityMin: number;
  humidityAvg: number;
  humidityMax: number;
  Disease: string;
}

interface DiseasePrediction {
  month: string;
  monthNumber: number;
  date: number;
  temperature: number;
  humidity: number;
  predictedDiseases: string[];
  confidence: number;
  similarConditions?: {
    temperature: number;
    humidity: number;
    diseases: string[];
  }[];
}

function SearchBox({
  value,
  onChange,
  onSubmit,
  className,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  className?: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`flex relative items-center justify-center h-10 ${className}`}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search location.."
        className="px-4 py-2 w-[230px] border border-gray-300 rounded-l-md focus:outline-none focus:border-blue-500 h-full text-sm transition-all duration-300 hover:shadow-md"
      />
      <button className="px-4 py-[9px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-r-md focus:outline-none hover:from-blue-600 hover:to-blue-700 h-full transition-all duration-300 shadow-md hover:shadow-lg">
        <IoSearch className="text-lg" />
      </button>
    </form>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <AnimatePresence>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <motion.ul 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-200 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2 z-10 shadow-xl"
        >
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1 text-sm">{error}</li>
          )}
          {suggestions.map((item, i) => (
            <motion.li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer p-1 rounded hover:bg-blue-50 text-sm transition-all duration-150"
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600 flex items-center hover:text-blue-700 transition-colors duration-200">
              <BsClipboard2Pulse className="mr-2 text-2xl" />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CureWave
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
              Home
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-blue-50">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function WeatherIcon({ condition }: { condition: string }) {
  const iconSize = "text-5xl";
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return <WiDaySunny className={`${iconSize} text-yellow-400 animate-pulse`} />;
    case 'rain':
      return <WiRain className={`${iconSize} text-blue-400 animate-rain`} />;
    case 'clouds':
      return <WiCloudy className={`${iconSize} text-gray-400 animate-float`} />;
    case 'snow':
      return <WiSnow className={`${iconSize} text-blue-200 animate-snow`} />;
    case 'thunderstorm':
      return <WiThunderstorm className={`${iconSize} text-purple-500 animate-thunder`} />;
    case 'fog':
    case 'mist':
    case 'haze':
      return <WiFog className={`${iconSize} text-gray-300 animate-fade`} />;
    default:
      return <WiDaySunny className={`${iconSize} text-yellow-400`} />;
  }
}

function DiseaseCard({ disease }: { disease: string }) {
  const getDiseaseColor = (disease: string) => {
    if (disease.includes('Cold') || disease.includes('Flu')) return 'from-blue-100 to-blue-50 hover:from-blue-500 hover:to-blue-400 text-blue-800 hover:text-white border-blue-200';
    if (disease.includes('Allerg')) return 'from-green-100 to-green-50 hover:from-green-500 hover:to-green-400 text-green-800 hover:text-white border-green-200';
    if (disease.includes('Heat')) return 'from-red-100 to-red-50 hover:from-red-500 hover:to-red-400 text-red-800 hover:text-white border-red-200';
    if (disease.includes('Respiratory')) return 'from-purple-100 to-purple-50 hover:from-purple-500 hover:to-purple-400 text-purple-800 hover:text-white border-purple-200';
    return 'from-gray-100 to-gray-50 hover:from-gray-500 hover:to-gray-400 text-gray-800 hover:text-white border-gray-200';
  };

  return (
    <Link 
      href={`/disease/${encodeURIComponent(disease)}`}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border bg-gradient-to-br h-full flex items-center justify-center ${getDiseaseColor(disease)}`}
    >
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="font-medium text-sm text-center"
      >
        {disease}
      </motion.div>
    </Link>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></motion.div>
    </div>
  );
}

function MonthFilter({ 
  selectedMonth, 
  setSelectedMonth 
}: { 
  selectedMonth: number | null; 
  setSelectedMonth: (month: number | null) => void 
}) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative">
      <select
        value={selectedMonth || ""}
        onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Months</option>
        {months.map((month, index) => (
          <option key={month} value={index + 1}>
            {month}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity, setLoadingCity] = useAtom(loadingCityAtom);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [diseasePrediction, setDiseasePrediction] = useState<DiseasePrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diseaseRecords, setDiseaseRecords] = useState<DiseaseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Search functionality state
  const [city, setCity] = useState("");
  const [searchError, setSearchError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadDiseaseData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to load disease data');
        }
        const jsonData = await response.json();
        
        const parsedData = jsonData.map((item: any) => ({
          Month: item.Month,
          monthNumber: parseInt(item.monthNumber),
          Date: parseInt(item.Date),
          tempMin: parseFloat(item.tempMin),
          tempAvg: parseFloat(item.tempAvg),
          tempMax: parseFloat(item.tempMax),
          humidityMin: parseFloat(item.humidityMin),
          humidityAvg: parseFloat(item.humidityAvg),
          humidityMax: parseFloat(item.humidityMax),
          Disease: item.Disease
        }));
        
        setDiseaseRecords(parsedData);
      } catch (err) {
        console.error('Error loading JSON:', err);
        setError('Failed to load disease data');
      }
    };

    loadDiseaseData();
  }, []);

  const predictDiseases = useCallback((
    temperature: number,
    humidity: number,
    monthNumber: number,
    date: number,
  ): DiseasePrediction => {
    if (diseaseRecords.length === 0) {
      return {
        month: new Date().toLocaleString('default', { month: 'long' }),
        monthNumber,
        date,
        temperature,
        humidity,
        predictedDiseases: ["No disease data available"],
        confidence: 0,
        similarConditions: []
      };
    }
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = monthNames[monthNumber - 1];
  
    const monthRecords = diseaseRecords.filter(
      record => record.monthNumber === monthNumber
    );
  
    if (monthRecords.length === 0) {
      return {
        month: currentMonth,
        monthNumber,
        date,
        temperature,
        humidity,
        predictedDiseases: ["No disease data for this month"],
        confidence: 0,
        similarConditions: []
      };
    }
  
    const dateRecords = monthRecords.filter(
      record => record.Date === date
    );
  
    const findBestMatch = (records: DiseaseRecord[]) => {
      return records.reduce<{record: DiseaseRecord | null, score: number}>(
        (best, record) => {
          const tempDiff = Math.abs(record.tempAvg - temperature);
          const humidityDiff = Math.abs(record.humidityAvg - humidity);
          const score = (tempDiff * 0.7) + (humidityDiff * 0.3);
          
          if (!best.record || score < best.score) {
            return { record, score };
          }
          return best;
        },
        { record: null, score: Infinity }
      ).record;
    };
  
    let bestMatch = findBestMatch(dateRecords);
    let matchType: 'date' | 'month' = 'date';
    
    if (!bestMatch) {
      bestMatch = findBestMatch(monthRecords);
      matchType = 'month';
    }                      
    {diseasePrediction?.predictedDiseases?.map((disease: string, index: number) => (
      <DiseaseCard key={index} disease={disease} />
    ))}
  
    let confidence = 0.5;
    if (bestMatch) {
      const tempDiff = Math.abs(bestMatch.tempAvg - temperature);
      const humidityDiff = Math.abs(bestMatch.humidityAvg - humidity);
      
      confidence = Math.max(0.3, 
        0.7 - (tempDiff / 10) - (humidityDiff / 20)
      );
      
      if (matchType === 'date') {
        confidence = Math.min(0.9, confidence + 0.2);
      }
    }
  
    const diseases = bestMatch 
      ? bestMatch.Disease.split(',').map(d => d.trim())
      : Array.from(new Set(
          monthRecords.flatMap(r => r.Disease.split(',').map(d => d.trim())
        )));
  
    const similarConditions = monthRecords
      .filter(record => {
        const tempDiff = Math.abs(record.tempAvg - temperature);
        const humidityDiff = Math.abs(record.humidityAvg - humidity);
        return tempDiff <= 5 && humidityDiff <= 10 && record.Date !== date;
      })
      .slice(0, 3)
      .map(record => ({
        temperature: record.tempAvg,
        humidity: record.humidityAvg,
        diseases: record.Disease.split(',').map(d => d.trim())
      }));
  
    return {
      month: currentMonth,
      monthNumber,
      date,
      temperature,
      humidity,
      predictedDiseases: diseases.length > 0 
        ? diseases 
        : ["No specific diseases identified"],
      confidence: parseFloat(confidence.toFixed(2)),
      similarConditions: similarConditions.length > 0 ? similarConditions : undefined
    };
  }, [diseaseRecords]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_APP}&cnt=56`
        );
        setWeatherData(data);

        if (data && data.list && data.list.length > 0 && diseaseRecords.length > 0) {
          const currentWeather = data.list[0];
          const tempC = currentWeather.main.temp - 273.15;  
          const humidity = currentWeather.main.humidity;
          const dateObj = new Date(currentWeather.dt * 1000);
          const monthNumber = dateObj.getMonth() + 1;  
          const date = dateObj.getDate();
          
          const prediction = predictDiseases(tempC, humidity, monthNumber, date);
          setDiseasePrediction(prediction);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    if (place) {
      fetchData();
    }
  }, [place, diseaseRecords, predictDiseases]);

  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_APP}`
        );

        const suggestions = response.data.list.map((item: any) => item.name);
        setSuggestions(suggestions);
        setSearchError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length === 0) {
      setSearchError("Location not found");
      setLoadingCity(false);
    } else {
      setSearchError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.NEXT_PUBLIC_WEATHER_APP}`
          );
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(response.data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <strong className="font-bold">Error: </strong>
              <span className="ml-1">{error}</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-xl shadow-lg text-center"
          >
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FiThermometer className="text-blue-500 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">No weather data available</h2>
            <p className="text-gray-600 mb-4">Please search for a location to view weather and health information.</p>
            <div className="flex justify-center">
              <button 
                onClick={handleCurrentLocation}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <MdMyLocation className="mr-2" />
                Use My Location
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 w-full">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header with Search */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 w-full"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Health Advisory
            </h1>
            <div className="flex items-center mt-1 text-gray-600">
              <MdOutlineLocationOn className="mr-1 text-blue-500" />
              <span className="font-medium">{place}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCurrentLocation}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 shadow-sm"
              title="Use current location"
            >
              <MdMyLocation className="text-blue-500 text-xl" />
            </motion.button>
            
            <div className="relative w-full md:w-auto">
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <SuggestionBox
                showSuggestions={showSuggestions}
                suggestions={suggestions}
                handleSuggestionClick={handleSuggestionClick}
                error={searchError}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          {/* Weather Overview Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg w-full"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiThermometer className="mr-2 text-blue-500" />
              Current Weather
            </h2>
            
            {weatherData.list && weatherData.list.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-4xl font-bold text-gray-800">
                      {(weatherData.list[0].main.temp - 273.15).toFixed(1)}°C
                    </div>
                    <div className="text-gray-500 capitalize">
                      {weatherData.list[0].weather[0].description}
                    </div>
                  </div>
                  <WeatherIcon condition={weatherData.list[0].weather[0].main} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <FiThermometer className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Feels like</div>
                      <div className="font-medium text-gray-800">
                        {(weatherData.list[0].main.feels_like - 273.15).toFixed(1)}°C
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <BsDropletHalf className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Humidity</div>
                      <div className="font-medium text-gray-800">
                        {weatherData.list[0].main.humidity}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <FiWind className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Wind</div>
                      <div className="font-medium text-gray-800">
                        {weatherData.list[0].wind.speed} m/s
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 rounded-full mr-3">
                      <BsCalendarDate className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="font-medium text-gray-800">
                        {new Date(weatherData.list[0].dt * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Health Advisory Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2 w-full"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BsClipboard2Pulse className="mr-2 text-green-500" />
              Health Advisory
            </h2>
            
            {diseasePrediction ? (
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
                >
                  <h3 className="font-medium text-lg text-blue-800 mb-2">Current Conditions Analysis</h3>
                  <p className="text-sm text-blue-700">
                    {diseasePrediction.month} {diseasePrediction.date}, {diseasePrediction.temperature.toFixed(1)}°C, {diseasePrediction.humidity}% humidity
                  </p>
                  
                  <div className="mt-3 flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${diseasePrediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium text-blue-800">
                      {Math.round(diseasePrediction.confidence * 100)}% confidence
                    </span>
                  </div>
                </motion.div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Potential Health Risks:</h4>
                    <MonthFilter selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                  </div>
                  
                  {selectedMonth ? (
                    <div>
                      <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          Showing historical data for {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {Array.from(
                          new Set(
                            diseaseRecords
                              .filter(record => record.monthNumber === selectedMonth)
                              .flatMap(record => record.Disease.split(',').map(d => d.trim()))
                          )
                        )
                        .filter((disease: string) => disease)
                        .map((disease: string, index: number) => (
                          <DiseaseCard key={index} disease={disease} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {diseasePrediction.predictedDiseases.map((disease: string, index: number) => (
                        <DiseaseCard key={index} disease={disease} />
                      ))}
                    </div>
                  )}
                </div>

                {diseasePrediction.similarConditions && diseasePrediction.similarConditions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-medium mb-2 text-gray-700">Similar Historical Conditions:</h4>
                    <div className="space-y-3">
                      {diseasePrediction.similarConditions.map((condition, index) => (
                        <div key={index} className="flex items-start text-sm">
                          <div className="bg-blue-100 p-1 rounded-full mr-2 mt-0.5">
                            <FiThermometer className="text-blue-500 text-xs" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-800">~{condition.temperature.toFixed(1)}°C, {condition.humidity}% humidity:</span>
                            <span className="text-gray-600 ml-1">{condition.diseases.join(", ")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
                >
                  <h4 className="font-medium text-green-800 mb-2">Recommendations:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-green-700">
                    <li>Stay hydrated by drinking plenty of water</li>
                    <li>Dress appropriately for the weather conditions</li>
                    {diseasePrediction.predictedDiseases.some(d => d.includes("Cold") || d.includes("Flu")) && (
                      <li>Consider getting a flu shot and washing hands frequently</li>
                    )}
                    {diseasePrediction.predictedDiseases.some(d => d.includes("Allerg")) && (
                      <li>Take allergy medication as needed and keep windows closed</li>
                    )}
                    {diseasePrediction.predictedDiseases.some(d => d.includes("Heat")) && (
                      <li>Avoid direct sunlight during peak hours and wear sunscreen</li>
                    )}
                    <li>Consult a healthcare provider if symptoms persist</li>
                  </ul>
                </motion.div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center"
              >
                <p className="text-gray-600">No health advisory available for current conditions.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white p-6 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-600">
            <BsClipboard2Pulse className="mr-2" />
            Hospital Bed Capacity
          </h2>
          <p className="text-gray-600 mb-6">
            View real-time bed availability and capacity projections for different hospital departments.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link 
              href="/department/Emergency"
              className="bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 p-4 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <h3 className="font-medium text-red-800">Emergency Department</h3>
              <p className="text-xs text-red-600 mt-1">View bed status</p>
            </Link>
            
            <Link 
              href="/department/ICU"
              className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 p-4 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <h3 className="font-medium text-purple-800">ICU</h3>
              <p className="text-xs text-purple-600 mt-1">View bed status</p>
            </Link>
            
            <Link 
              href="/department/General%20Ward"
              className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 p-4 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <h3 className="font-medium text-blue-800">General Ward</h3>
              <p className="text-xs text-blue-600 mt-1">View bed status</p>
            </Link>
            
            <Link 
              href="/department/Pediatrics"
              className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 p-4 rounded-lg transition-all duration-300 hover:shadow-md"
            >
              <h3 className="font-medium text-green-800">Pediatrics</h3>
              <p className="text-xs text-green-600 mt-1">View bed status</p>
            </Link>
          </div>
          
          <div className="mt-6 text-center">
            <Link 
              href="/department/all"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              View All Departments
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Add some custom animations in the styles */}
      <style jsx global>{`
        @keyframes rain {
          0% { transform: translateY(-5px); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(5px); opacity: 0; }
        }
        .animate-rain {
          animation: rain 1.5s infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes snow {
          0% { transform: translateY(-5px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(5px) rotate(360deg); opacity: 0; }
        }
        .animate-snow {
          animation: snow 2s infinite;
        }
        @keyframes thunder {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-thunder {
          animation: thunder 1s infinite;
        }
        @keyframes fade {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-fade {
          animation: fade 3s infinite;
        }
      `}</style>
    </div>
  );
}