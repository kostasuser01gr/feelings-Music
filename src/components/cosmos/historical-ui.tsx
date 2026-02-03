/**
 * Historical Universe UI Components
 * User interface for timeline navigation, skill management, and learning
 */

'use client';

import React, { useState } from 'react';
import { TimelineNavigator, type HistoricalEra } from '@/lib/timeline-system';
import { MagicSkillTree, type MagicSkill } from '@/lib/magic-skill-system';
import { InteractiveKnowledgeBase, type LearningModule } from '@/lib/knowledge-system';

export const HistoricalTimeline: React.FC<{
  navigator: TimelineNavigator;
  onYearChange: (year: number) => void;
}> = ({ navigator, onYearChange }) => {
  const [currentYear, setCurrentYear] = useState(0);
  const [selectedEra, setSelectedEra] = useState<HistoricalEra | null>(null);
  const eras = navigator.getAllEras();
  
  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    navigator.setYear(year);
    setSelectedEra(navigator.getCurrentEra(year));
    onYearChange(year);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Timeline Slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-lg">
              {currentYear >= 0 ? `${currentYear} CE` : `${Math.abs(currentYear)} BCE`}
            </span>
            {selectedEra && (
              <span className="text-purple-300 text-sm">
                {selectedEra.name} • {selectedEra.civilization}
              </span>
            )}
          </div>
          
          <input
            type="range"
            min={-4500}
            max={2100}
            value={currentYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-cyan-500 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-purple-500"
          />
          
          {/* Era Markers */}
          <div className="relative mt-2 h-8">
            {eras.map((era) => {
              const position = ((era.period.start + 4500) / 6600) * 100;
              return (
                <div
                  key={era.id}
                  className="absolute transform -translate-x-1/2 cursor-pointer group"
                  style={{ left: `${position}%` }}
                  onClick={() => handleYearChange(era.period.start)}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all group-hover:scale-150"
                    style={{ backgroundColor: era.visualTheme.colors[0] }}
                  />
                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 
                    transition-opacity bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {era.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Current Era Info */}
        {selectedEra && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="text-purple-300 text-xs font-semibold mb-1">MUSIC STYLE</h3>
              <p className="text-white text-sm">
                {selectedEra.musicalStyle.instruments.slice(0, 3).join(', ')}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                {selectedEra.musicalStyle.characteristics.slice(0, 2).join(', ')}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="text-cyan-300 text-xs font-semibold mb-1">EMOTIONS</h3>
              <p className="text-white text-sm capitalize">{selectedEra.emotions.primary}</p>
              <p className="text-gray-400 text-xs mt-1">
                {selectedEra.emotions.secondary.slice(0, 2).join(', ')}
              </p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <h3 className="text-amber-300 text-xs font-semibold mb-1">ACHIEVEMENTS</h3>
              <p className="text-white text-sm">
                {selectedEra.culturalAchievements[0]?.slice(0, 40)}...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MagicSkillPanel: React.FC<{
  skillTree: MagicSkillTree;
  onSkillCast: (skillId: string) => void;
}> = ({ skillTree, onSkillCast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<MagicSkill | null>(null);
  
  const allSkills = skillTree.getAllSkills();
  const unlockedSkills = skillTree.getUnlockedSkills();
  const playerLevel = skillTree.getPlayerLevel();
  const playerMana = skillTree.getPlayerMana();
  const maxMana = skillTree.getMaxMana();
  
  const categories = ['all', 'elemental', 'harmonic', 'temporal', 'cosmic', 'cultural', 'creative', 'transcendent'];
  
  const filteredSkills = selectedCategory === 'all' 
    ? allSkills 
    : allSkills.filter(s => s.category === selectedCategory);
  
  return (
    <>
      {/* Floating Skill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full 
          shadow-lg flex items-center justify-center text-white font-bold text-2xl hover:scale-110 
          transition-transform z-50"
      >
        ✨
      </button>
      
      {/* Skill Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-black/95 backdrop-blur-xl border-l border-purple-500/30 
          overflow-y-auto z-40">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Magic Skills</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Player Stats */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 text-sm">Level {playerLevel}</span>
                <span className="text-pink-300 text-sm">
                  {unlockedSkills.length} / {allSkills.length} Skills
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Mana</span>
                  <span>{playerMana} / {maxMana}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(playerMana / maxMana) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Skills Grid */}
            <div className="space-y-3">
              {filteredSkills.map(skill => {
                const canUnlock = skill.requirements.level <= playerLevel;
                const canCast = skill.unlocked && playerMana >= skill.manaCost;
                
                return (
                  <div
                    key={skill.id}
                    onClick={() => setSelectedSkill(skill)}
                    className={`bg-white/5 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      selectedSkill?.id === skill.id
                        ? 'border-purple-500 bg-purple-900/20'
                        : skill.unlocked
                        ? 'border-green-500/30 hover:border-green-500/50'
                        : canUnlock
                        ? 'border-yellow-500/30 hover:border-yellow-500/50'
                        : 'border-gray-700/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{skill.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getRarityColor(skill.rarity)}`}>
                            {skill.rarity}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-900/50 text-purple-300">
                            {skill.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-blue-300 text-sm font-semibold">{skill.manaCost} ⚡</div>
                        <div className="text-yellow-300 text-xs">Tier {skill.tier}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{skill.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Requires Lv. {skill.requirements.level}
                      </span>
                      
                      {skill.unlocked ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canCast) onSkillCast(skill.id);
                          }}
                          disabled={!canCast}
                          className={`px-3 py-1 rounded ${
                            canCast
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Cast
                        </button>
                      ) : canUnlock ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            skillTree.unlockSkill(skill.id);
                          }}
                          className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Unlock
                        </button>
                      ) : (
                        <span className="text-red-400">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Skill Details */}
            {selectedSkill && (
              <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-purple-900/50 to-transparent p-6">
                <h3 className="text-xl font-bold text-white mb-2">{selectedSkill.name}</h3>
                <p className="text-purple-300 text-sm italic mb-3">{selectedSkill.lore}</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Power:</span>
                    <span className="text-white ml-2">{selectedSkill.power}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cooldown:</span>
                    <span className="text-white ml-2">{selectedSkill.cooldown}s</span>
                  </div>
                  {selectedSkill.culturalOrigin && (
                    <div className="col-span-2">
                      <span className="text-gray-400">Origin:</span>
                      <span className="text-amber-300 ml-2">{selectedSkill.culturalOrigin}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'bg-gray-700 text-gray-300';
    case 'uncommon': return 'bg-green-700 text-green-300';
    case 'rare': return 'bg-blue-700 text-blue-300';
    case 'epic': return 'bg-purple-700 text-purple-300';
    case 'legendary': return 'bg-orange-700 text-orange-300';
    case 'mythic': return 'bg-pink-700 text-pink-300';
    default: return 'bg-gray-700 text-gray-300';
  }
}

export const LearningModulePanel: React.FC<{
  knowledgeBase: InteractiveKnowledgeBase;
  onModuleStart: (moduleId: string) => void;
}> = ({ knowledgeBase, onModuleStart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const allModules = knowledgeBase.getAllModules();
  const availableModules = knowledgeBase.getAvailableModules();
  const completionPercentage = knowledgeBase.getCompletionPercentage();
  
  const categories = ['all', 'music-theory', 'history', 'culture', 'instrument', 'emotion', 'philosophy'];
  
  const filteredModules = filterCategory === 'all'
    ? allModules
    : knowledgeBase.getModulesByCategory(filterCategory);
  
  return (
    <>
      {/* Floating Learn Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-44 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full 
          shadow-lg flex items-center justify-center text-white font-bold text-2xl hover:scale-110 
          transition-transform z-50"
      >
        📚
      </button>
      
      {/* Learning Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-[500px] h-full bg-black/95 backdrop-blur-xl border-l border-cyan-500/30 
          overflow-y-auto z-40">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Learning Modules</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Progress */}
            <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-cyan-300 text-sm">Overall Progress</span>
                <span className="text-blue-300 text-sm font-bold">
                  {completionPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {availableModules.length} modules available to start
              </p>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filterCategory === category
                      ? 'bg-cyan-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Modules List */}
            <div className="space-y-3">
              {filteredModules.map(module => {
                const isAvailable = availableModules.some(m => m.id === module.id);
                
                return (
                  <div
                    key={module.id}
                    onClick={() => setSelectedModule(module)}
                    className={`bg-white/5 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      selectedModule?.id === module.id
                        ? 'border-cyan-500 bg-cyan-900/20'
                        : module.completed
                        ? 'border-green-500/30 opacity-75'
                        : isAvailable
                        ? 'border-blue-500/30 hover:border-blue-500/50'
                        : 'border-gray-700/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{module.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(module.difficulty)}`}>
                            {module.difficulty}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300">
                            {module.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            ~{module.estimatedTime} min
                          </span>
                        </div>
                      </div>
                      
                      {module.completed && (
                        <span className="text-green-400 text-2xl">✓</span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{module.description}</p>
                    
                    {module.progress > 0 && !module.completed && (
                      <div className="mb-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-yellow-400">
                        +{module.rewards.experience} XP
                      </div>
                      
                      {!module.completed && isAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onModuleStart(module.id);
                          }}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner': return 'bg-green-700 text-green-300';
    case 'intermediate': return 'bg-yellow-700 text-yellow-300';
    case 'advanced': return 'bg-orange-700 text-orange-300';
    case 'master': return 'bg-red-700 text-red-300';
    default: return 'bg-gray-700 text-gray-300';
  }
}

export const CivilizationSelector: React.FC<{
  navigator: TimelineNavigator;
  onCivilizationSelect: (eraId: string) => void;
}> = ({ navigator, onCivilizationSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const eras = navigator.getAllEras();
  const filteredEras = eras.filter(era => 
    era.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    era.civilization.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <>
      {/* Floating Civilization Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-32 right-6 w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full 
          shadow-lg flex items-center justify-center text-white font-bold text-2xl hover:scale-110 
          transition-transform z-50"
      >
        🏛️
      </button>
      
      {/* Civilization Grid */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Explore Civilizations</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search civilizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white 
                placeholder-gray-400 mb-6 focus:outline-none focus:border-amber-500"
            />
            
            {/* Grid */}
            <div className="grid grid-cols-3 gap-4">
              {filteredEras.map(era => (
                <div
                  key={era.id}
                  onClick={() => {
                    onCivilizationSelect(era.id);
                    setIsOpen(false);
                  }}
                  className="bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-6 border-2 border-white/20 
                    hover:border-amber-500 cursor-pointer transition-all hover:scale-105 group"
                >
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                    {era.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{era.civilization}</p>
                  
                  <div className="flex gap-2 mb-3">
                    {era.visualTheme.colorValues.slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: `#${color.getHexString()}` }}
                      />
                    ))}
                  </div>
                  
                  <p className="text-gray-500 text-xs mb-2">
                    {era.period.start >= 0 ? `${era.period.start} CE` : `${Math.abs(era.period.start)} BCE`} - 
                    {era.period.end >= 0 ? ` ${era.period.end} CE` : ` ${Math.abs(era.period.end)} BCE`}
                  </p>
                  
                  <p className="text-amber-300 text-xs">
                    {era.culturalAchievements[0]?.slice(0, 50)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
