/**
 * Custom Planet Builder UI
 * Interactive tool for designing and creating custom planets
 */

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as THREE from 'three';

export interface CustomPlanetConfig {
  id: string;
  name: string;
  radius: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  hasRings: boolean;
  ringColor?: string;
  hasMoons: boolean;
  moonCount?: number;
  atmosphere: boolean;
  atmosphereColor?: string;
  texture?: 'rocky' | 'gaseous' | 'icy' | 'desert' | 'ocean';
  emissive: boolean;
  emissiveIntensity?: number;
}

interface PlanetBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlanet: (config: CustomPlanetConfig) => void;
}

export function PlanetBuilder({ isOpen, onClose, onCreatePlanet }: PlanetBuilderProps) {
  const [config, setConfig] = useState<CustomPlanetConfig>({
    id: `custom_${Date.now()}`,
    name: 'New Planet',
    radius: 1,
    color: '#4169E1',
    orbitRadius: 30,
    orbitSpeed: 0.5,
    rotationSpeed: 1,
    hasRings: false,
    hasMoons: false,
    atmosphere: false,
    texture: 'rocky',
    emissive: false
  });
  
  const handleCreate = () => {
    onCreatePlanet(config);
    onClose();
    
    // Reset for next creation
    setConfig({
      id: `custom_${Date.now()}`,
      name: 'New Planet',
      radius: 1,
      color: '#4169E1',
      orbitRadius: 30,
      orbitSpeed: 0.5,
      rotationSpeed: 1,
      hasRings: false,
      hasMoons: false,
      atmosphere: false,
      texture: 'rocky',
      emissive: false
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🪐 Create Custom Planet</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Properties */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Basic Properties</h3>
            
            <div>
              <label className="block text-sm mb-1">Planet Name</label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter planet name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Radius ({config.radius.toFixed(1)})</label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={config.radius}
                  onChange={(e) => setConfig({ ...config, radius: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">Color</label>
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Surface Type</label>
              <select
                value={config.texture}
                onChange={(e) => setConfig({ ...config, texture: e.target.value as any })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
              >
                <option value="rocky">Rocky</option>
                <option value="gaseous">Gaseous</option>
                <option value="icy">Icy</option>
                <option value="desert">Desert</option>
                <option value="ocean">Ocean</option>
              </select>
            </div>
          </div>
          
          {/* Orbital Properties */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Orbital Properties</h3>
            
            <div>
              <label className="block text-sm mb-1">
                Orbit Radius ({config.orbitRadius.toFixed(0)})
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={config.orbitRadius}
                onChange={(e) => setConfig({ ...config, orbitRadius: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">
                  Orbit Speed ({config.orbitSpeed.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.1"
                  value={config.orbitSpeed}
                  onChange={(e) => setConfig({ ...config, orbitSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">
                  Rotation Speed ({config.rotationSpeed.toFixed(2)})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={config.rotationSpeed}
                  onChange={(e) => setConfig({ ...config, rotationSpeed: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Features</h3>
            
            {/* Rings */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Planetary Rings</label>
              <input
                type="checkbox"
                checked={config.hasRings}
                onChange={(e) => setConfig({ ...config, hasRings: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            
            {config.hasRings && (
              <div>
                <label className="block text-sm mb-1">Ring Color</label>
                <input
                  type="color"
                  value={config.ringColor || '#888888'}
                  onChange={(e) => setConfig({ ...config, ringColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            )}
            
            {/* Moons */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Moons</label>
              <input
                type="checkbox"
                checked={config.hasMoons}
                onChange={(e) => setConfig({ ...config, hasMoons: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            
            {config.hasMoons && (
              <div>
                <label className="block text-sm mb-1">
                  Number of Moons ({config.moonCount || 1})
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={config.moonCount || 1}
                  onChange={(e) => setConfig({ ...config, moonCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Atmosphere */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Atmosphere</label>
              <input
                type="checkbox"
                checked={config.atmosphere}
                onChange={(e) => setConfig({ ...config, atmosphere: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            
            {config.atmosphere && (
              <div>
                <label className="block text-sm mb-1">Atmosphere Color</label>
                <input
                  type="color"
                  value={config.atmosphereColor || '#87CEEB'}
                  onChange={(e) => setConfig({ ...config, atmosphereColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            )}
            
            {/* Emissive */}
            <div className="flex items-center justify-between">
              <label className="text-sm">Self-Illuminating</label>
              <input
                type="checkbox"
                checked={config.emissive}
                onChange={(e) => setConfig({ ...config, emissive: e.target.checked })}
                className="w-5 h-5"
              />
            </div>
            
            {config.emissive && (
              <div>
                <label className="block text-sm mb-1">
                  Glow Intensity ({((config.emissiveIntensity || 0.5) * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.emissiveIntensity || 0.5}
                  onChange={(e) => setConfig({ ...config, emissiveIntensity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* Preview */}
          <div className="border border-gray-700 rounded p-4">
            <h3 className="font-semibold mb-2">Preview</h3>
            <div className="bg-black rounded p-6 flex items-center justify-center">
              <div
                className="rounded-full shadow-lg transition-all"
                style={{
                  width: `${config.radius * 40}px`,
                  height: `${config.radius * 40}px`,
                  backgroundColor: config.color,
                  boxShadow: config.emissive
                    ? `0 0 ${config.radius * 20}px ${config.color}`
                    : 'none'
                }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-400 space-y-1">
              <p>Name: {config.name}</p>
              <p>Type: {config.texture}</p>
              <p>Orbit: {config.orbitRadius} units</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Create Planet
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Planet Builder Hook
export function usePlanetBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [customPlanets, setCustomPlanets] = useState<CustomPlanetConfig[]>([]);
  
  const openBuilder = () => setIsOpen(true);
  const closeBuilder = () => setIsOpen(false);
  
  const handleCreatePlanet = (config: CustomPlanetConfig) => {
    setCustomPlanets(prev => [...prev, config]);
  };
  
  const deletePlanet = (id: string) => {
    setCustomPlanets(prev => prev.filter(p => p.id !== id));
  };
  
  return {
    isOpen,
    openBuilder,
    closeBuilder,
    customPlanets,
    handleCreatePlanet,
    deletePlanet
  };
}
