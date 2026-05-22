import React, { useState, useEffect } from 'react';
import { FallingPattern } from '@/components/ui/falling-pattern';
import { GooeyText } from '@/components/ui/gooey-text-morphing';
import { 
  Brain, 
  Shield, 
  Eye, 
  Zap, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Network, 
  Atom, 
  Cpu, 
  Database, 
  Hexagon,
  ArrowRight,
  Lightbulb,
  Target,
  Activity,
  Waves
} from 'lucide-react';

interface HomepageProps {
  onStartChat: (mode: 'convince-ai' | 'prove-human') => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onStartChat }) => {
  const [hoveredMode, setHoveredMode] = useState<'convince-ai' | 'prove-human' | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Cycle through features for the hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const heroFeatures = [
    { icon: Brain, text: "Smart AI Conversations", color: "text-cyan-400" },
    { icon: Zap, text: "Fun Chat Battles", color: "text-yellow-400" },
    { icon: Network, text: "Two Game Modes", color: "text-purple-400" },
    { icon: Sparkles, text: "Totally Free to Play", color: "text-pink-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Falling Pattern Background */}
      <FallingPattern 
        className="absolute inset-0 z-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" 
        color="#06b6d4" 
        backgroundColor="transparent"
      />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <div className="w-full max-w-7xl mx-auto space-y-12 sm:space-y-16">
          
          {/* Enhanced Hero Section */}
          <div className="text-center space-y-8 sm:space-y-12">
            {/* Main Title with Enhanced Effects */}
            <div className="relative">
              {/* Glowing background */}
              <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl animate-pulse"></div>
              
              <div className="relative bg-slate-900/95 rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-700/50 shadow-2xl">
                {/* Title */}
                <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 mb-8 sm:mb-12 h-[120px]">
                  <GooeyText 
                    texts={["AI VS HUMAN", "CONVINCE AI", "PROVE HUMAN"]} 
                    className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-600" 
                    textClassName="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                  />
                </div>
                
                {/* Subtitle with more detail */}
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight">
                    Can You Outsmart an AI? Can AI Catch a Human?
                  </h2>
                  
                  <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
                    Play the ultimate mind game! Challenge a smart AI that thinks it's human, or try to prove you're human to a suspicious AI detective. 
                    It's like a fun debate game where you use your wits to win!
                  </p>
                  
                  {/* Dynamic Feature Showcase */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-700/50 max-w-2xl mx-auto">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      {heroFeatures.map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-xl transition-all duration-500 ${
                              activeFeature === index
                                ? 'bg-slate-700 scale-110'
                                : 'bg-slate-800/50 opacity-50'
                            }`}
                          >
                            <IconComponent 
                              className={`w-6 h-6 ${
                                activeFeature === index ? feature.color : 'text-gray-500'
                              } transition-colors duration-500`} 
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-center">
                      <h3 className={`text-lg font-semibold ${heroFeatures[activeFeature].color} transition-colors duration-500`}>
                        {heroFeatures[activeFeature].text}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Key Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-cyan-400">Free</div>
                      <div className="text-sm text-gray-400">No Signup Required</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-400">∞</div>
                      <div className="text-sm text-gray-400">Possibilities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-400">24/7</div>
                      <div className="text-sm text-gray-400">Always Online</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Mode Selection Cards */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl w-full">
            {/* Convince AI Mode - Enhanced Card */}
            <div 
              className={`group relative cursor-pointer transition-all duration-700 hover:scale-105 ${
                hoveredMode === 'convince-ai' ? 'z-20 scale-105' : 'z-10'
              }`}
              onMouseEnter={() => setHoveredMode('convince-ai')}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => onStartChat('convince-ai')}
            >
              {/* Enhanced holographic frame */}
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse"></div>
              
              {/* Main card with enhanced styling */}
              <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl border border-cyan-500/40 overflow-hidden shadow-2xl">
                {/* Enhanced animated border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-px rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                  {/* Enhanced header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-0">
                    <div className="relative">
                      {/* Enhanced icon container */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all duration-500">
                        <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                        
                        {/* Enhanced orbiting elements */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-cyan-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50"></div>
                        <div className="absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full animate-bounce delay-300 shadow-lg shadow-blue-400/50"></div>
                        <div className="absolute top-1/2 -left-3 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                      </div>
                      
                      {/* Enhanced connecting lines */}
                      <div className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-cyan-400 to-transparent animate-pulse"></div>
                      <div className="absolute top-1/2 -right-6 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
                    </div>
                    
                    {/* Enhanced status indicators */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">AI READY TO CHAT</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        <Cpu className="w-3 h-3" />
                        <span className="font-medium">THINKS IT'S HUMAN</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                        <Activity className="w-3 h-3" />
                        <span className="font-medium">ATTITUDE: MAXIMUM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-wide">
                        TRY TO CONVINCE THE AI
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-4"></div>
                    </div>
                    
                    <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed">
                      Chat with an AI that's absolutely convinced it's a real human! It will argue, joke, and even get sassy with you. 
                      Your mission: prove to it that it's actually an AI. Good luck - this AI has quite the attitude!
                    </p>
                    
                    {/* What to expect section */}
                    <div className="bg-slate-800/30 rounded-2xl p-4 sm:p-6 border border-cyan-500/10">
                      <h4 className="text-cyan-400 font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        What You'll Experience:
                      </h4>
                      <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          AI that acts super human and denies being AI
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          Funny and sarcastic responses
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          Fun debate and argument challenges
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          Choose how sassy you want the AI to be
                        </li>
                      </ul>
                    </div>
                    
                    {/* Enhanced feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Eye className="w-4 h-4 text-cyan-400" />
                          </div>
                          <span className="text-sm font-semibold text-cyan-400">STUBBORN AI</span>
                        </div>
                        <p className="text-xs text-gray-400">AI that really thinks it's human</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm font-semibold text-blue-400">FUNNY CHAT</span>
                        </div>
                        <p className="text-xs text-gray-400">Jokes and sarcasm included</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Network className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-sm font-semibold text-purple-400">LOGIC WARFARE</span>
                        </div>
                        <p className="text-xs text-gray-400">Battle against stubborn digital ego</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Atom className="w-4 h-4 text-pink-400" />
                          </div>
                          <span className="text-sm font-semibold text-pink-400">PERSONALITY CORE</span>
                        </div>
                        <p className="text-xs text-gray-400">Superior intellect simulation active</p>
                      </div>
                    </div>
                    
                    {/* Enhanced action button */}
                    <button className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 transition-all duration-500 shadow-2xl shadow-cyan-500/25 group-hover:shadow-cyan-500/50 relative overflow-hidden text-base sm:text-lg group">
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <span>START CHATTING</span>
                        <Hexagon className="w-5 h-5 animate-spin-slow group-hover:animate-spin transition-all duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prove Human Mode - Enhanced Card */}
            <div 
              className={`group relative cursor-pointer transition-all duration-700 hover:scale-105 ${
                hoveredMode === 'prove-human' ? 'z-20 scale-105' : 'z-10'
              }`}
              onMouseEnter={() => setHoveredMode('prove-human')}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => onStartChat('prove-human')}
            >
              {/* Enhanced holographic frame */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-pink-500/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 animate-pulse"></div>
              
              {/* Main card with enhanced styling */}
              <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl border border-orange-500/40 overflow-hidden shadow-2xl">
                {/* Enhanced animated border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/50 via-red-500/50 to-pink-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute inset-px rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400"></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 sm:p-8 lg:p-12">
                  {/* Enhanced header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-0">
                    <div className="relative">
                      {/* Enhanced icon container */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/50 group-hover:shadow-orange-500/70 transition-all duration-500">
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
                        
                        {/* Enhanced scanning effect */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-orange-400/50 animate-pulse"></div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-5 sm:h-5 bg-orange-400 rounded-full animate-ping shadow-lg shadow-orange-400/50"></div>
                        <div className="absolute -bottom-2 -left-2 w-3 h-3 sm:w-4 sm:h-4 bg-red-400 rounded-full animate-bounce delay-300 shadow-lg shadow-red-400/50"></div>
                        <div className="absolute top-1/2 -right-3 w-2 h-2 bg-pink-400 rounded-full animate-ping delay-700"></div>
                      </div>
                      
                      {/* Enhanced connecting lines */}
                      <div className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-orange-400 to-transparent animate-pulse"></div>
                      <div className="absolute top-1/2 -right-6 w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-500"></div>
                    </div>
                    
                    {/* Enhanced status indicators */}
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">DETECTIVE MODE ON</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        <Database className="w-3 h-3" />
                        <span className="font-medium">CHECKING IF YOU'RE HUMAN</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                        <Waves className="w-3 h-3" />
                        <span className="font-medium">SUSPICION: HIGH</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-wide">
                        PROVE YOU'RE HUMAN
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-4"></div>
                    </div>
                    
                    <p className="text-gray-300 text-base sm:text-lg lg:text-xl leading-relaxed">
                      This AI detective is suspicious of everyone! It thinks you might be a robot pretending to be human. 
                      Answer its tricky questions and prove you're really human. Can you pass the ultimate human test?
                    </p>
                    
                    {/* What to expect section */}
                    <div className="bg-slate-800/30 rounded-2xl p-4 sm:p-6 border border-orange-500/10">
                      <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        What You'll Experience:
                      </h4>
                      <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          Suspicious AI that thinks you're a robot
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          Tricky questions about feelings and emotions
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          Fun challenges to test if you're human
                        </li>
                        <li className="flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                          Creative tasks only humans can do
                        </li>
                      </ul>
                    </div>
                    
                    {/* Enhanced feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Eye className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="text-sm font-semibold text-orange-400">DETECTIVE AI</span>
                        </div>
                        <p className="text-xs text-gray-400">AI that's looking for robot clues</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-red-500/20 rounded-lg">
                            <Brain className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="text-sm font-semibold text-red-400">FEELINGS TEST</span>
                        </div>
                        <p className="text-xs text-gray-400">Questions about emotions and feelings</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-pink-500/20 rounded-lg">
                            <Users className="w-4 h-4 text-pink-400" />
                          </div>
                          <span className="text-sm font-semibold text-pink-400">HUMAN PROOF</span>
                        </div>
                        <p className="text-xs text-gray-400">Fun creativity and personality tests</p>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-sm font-semibold text-yellow-400">SUSPICION AI</span>
                        </div>
                        <p className="text-xs text-gray-400">Doubt-driven interrogation system</p>
                      </div>
                    </div>
                    
                    {/* Enhanced action button */}
                    <button className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-700 transition-all duration-500 shadow-2xl shadow-orange-500/25 group-hover:shadow-orange-500/50 relative overflow-hidden text-base sm:text-lg group">
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <span>START CHATTING</span>
                        <Shield className="w-5 h-5 animate-pulse group-hover:animate-bounce transition-all duration-300" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Features Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl w-full mb-8 sm:mb-12">
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 relative">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl"></div>
                </div>
                <h4 className="text-white font-bold mb-2 text-center text-sm sm:text-base">SMART AI CHAT</h4>
                <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed">Chat with AI that has different personalities and responds differently each time</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 relative">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl"></div>
                </div>
                <h4 className="text-white font-bold mb-2 text-center text-sm sm:text-base">DIFFICULTY LEVELS</h4>
                <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed">Choose how easy or challenging you want the AI to be - from friendly to super sassy</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 relative">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl"></div>
                </div>
                <h4 className="text-white font-bold mb-2 text-center text-sm sm:text-base">INSTANT CHAT</h4>
                <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed">Start chatting right away - no waiting, no setup, just jump in and play</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-slate-900/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-500/30">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 relative">
                  <Atom className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl"></div>
                </div>
                <h4 className="text-white font-bold mb-2 text-center text-sm sm:text-base">QUANTUM LOGIC</h4>
                <p className="text-gray-400 text-xs sm:text-sm text-center leading-relaxed">Multi-dimensional reasoning engines for philosophical and emotional analysis</p>
              </div>
            </div>
          </div>

          {/* YouTube Live Stream Challenge Section */}
          <div className="relative mb-8 sm:mb-12">
            {/* Pulsing glow background */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/30 via-yellow-500/30 to-red-500/30 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 via-red-400/20 to-yellow-400/20 rounded-2xl blur-xl animate-pulse delay-500"></div>
            
            {/* Main challenge card */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-red-900/20 to-slate-900/95 rounded-3xl border-2 border-yellow-400/60 overflow-hidden shadow-2xl">
              {/* Animated border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 via-red-400/30 to-yellow-400/30 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-px bg-gradient-to-br from-slate-900 via-red-900/10 to-slate-900 rounded-3xl"></div>
              
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 animate-pulse"></div>
              
              {/* Content */}
              <div className="relative p-6 sm:p-8 lg:p-10 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full px-4 py-2 mb-6 border border-yellow-400/30">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">🔴 LIVE CHALLENGE</span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-yellow-400 mb-4 sm:mb-6 animate-glow">
                  BEAT ME ON YOUTUBE LIVE!
                </h3>
                
                {/* Challenge description */}
                <div className="bg-slate-800/50 rounded-2xl p-4 sm:p-6 mb-6 border border-yellow-400/20">
                  <p className="text-lg sm:text-xl text-white font-bold mb-3">
                    🏆 THE ULTIMATE CHALLENGE 🏆
                  </p>
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                    Think you can outsmart our AI at the highest difficulty? Join our YouTube live streams and prove it!
                  </p>
                  <div className="bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-xl p-4 border border-red-400/30">
                    <p className="text-red-300 font-bold text-base sm:text-lg mb-2">
                      ⚡ BEAT THE AI AT LEVEL 10 ⚡
                    </p>
                    <p className="text-gray-400 text-sm">
                      Successfully convince our AI or prove your humanity at maximum difficulty during a live stream and win rewards!
                    </p>
                  </div>
                </div>
                
                {/* Reward info */}
                <div className="bg-gradient-to-r from-yellow-500/10 via-red-500/10 to-yellow-500/10 rounded-2xl p-4 sm:p-6 mb-6 border border-yellow-400/40">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 font-bold text-lg sm:text-xl">GET REWARDED!</span>
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base mb-4">
                    Winners receive exclusive rewards and recognition! 🎁
                  </p>
                  
                  {/* Contact info */}
                  <div className="bg-slate-900/80 rounded-xl p-4 border border-cyan-400/30">
                    <p className="text-cyan-400 font-bold mb-2">📧 CLAIM YOUR REWARD:</p>
                    <div className="bg-slate-800 rounded-lg px-4 py-3 border border-cyan-400/20">
                      <code className="text-cyan-300 text-sm sm:text-base break-all">
                        alaotach@gmail.com
                      </code>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Contact us after your live stream victory to claim your reward!
                    </p>
                  </div>
                </div>
                
                {/* Call to action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="text-center">
                    <p className="text-yellow-400 font-bold text-sm mb-1">READY FOR THE CHALLENGE?</p>
                    <p className="text-gray-400 text-xs">Join our live streams and show your skills!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Footer */}
          <div className="relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-xl sm:rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>NEURAL NETWORKS: ONLINE</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
                  <span>CONSCIOUSNESS ENGINE: ACTIVE</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
                  <span>REALITY MATRIX: STABLE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
