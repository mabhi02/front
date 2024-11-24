import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { 
  AlertTriangle, 
  Radio, 
  Signal, 
  Shield, 
  Clock, 
  Wind, 
  Server, 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Thermometer, 
  Wifi, 
  Navigation,
  Minimize2, 
  Maximize2, 
  CrosshairIcon, 
  Battery, 
  Edit, 
  Trash2,
  LogOut,
  User
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import * as THREE from 'three';

// Constants
const THREAT_TYPES = [
  'Unauthorized Access',
  'Suspicious Activity',
  'Security Breach',
  'Perimeter Violation',
  'Drone Malfunction',
  'Communication Interference',
  'Unknown Entity'
];

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const SECTORS = Array.from({ length: 5 }, (_, i) => 
  Array.from({ length: 9 }, (_, j) => `${String.fromCharCode(65 + i)}-${j + 1}`)
).flat();

// Building Component
function Building({ position, height, color }) {
  return (
    <mesh position={[position[0], height/2, position[2]]}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial 
        color={color} 
        transparent
        opacity={0.8}
        metalness={0.5}
        roughness={0.2}
      />
    </mesh>
  );
}

// Enhanced ThreatMarker Component
const ThreatMarker = ({ position, onClick, severity, resolved }) => {
  const [hover, setHover] = useState(false);
  const pulseRef = useRef();
  
  const severityColors = {
    Critical: '#ff0000',
    High: '#ff4d00',
    Medium: '#ff9900',
    Low: '#ffcc00'
  };
  
  const baseColor = resolved ? '#4CAF50' : severityColors[severity];
  
  useFrame(({ clock }) => {
    if (pulseRef.current && !resolved) {
      pulseRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      pulseRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      pulseRef.current.scale.z = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
    }
  });

  return (
    <group 
      position={[position.x, 0.1, position.z]} 
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Base cylinder */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial 
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hover ? 1 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Vertical beam */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial
          color={baseColor}
          transparent
          opacity={0.2}
          emissive={baseColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Pulsing ring for unresolved threats */}
      {!resolved && (
        <group ref={pulseRef}>
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial 
              color={baseColor}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Point light for glow effect */}
      <pointLight
        color={baseColor}
        intensity={0.5}
        distance={2}
        decay={2}
      />
    </group>
  );
};

// CityGrid Component
function CityGrid({ threats, onAddThreat, onThreatClick }) {
  const buildings = [];
  const gridSize = 15;
  const spacing = 1.5;

  for (let x = -gridSize; x < gridSize; x++) {
    for (let z = -gridSize; z < gridSize; z++) {
      const height = Math.random() * 4 + 0.5;
      const color = Math.random() > 0.8 ? '#4a9eff' : '#2a3b4c';
      
      buildings.push(
        <Building 
          key={`building-${x}-${z}`}
          position={[x * spacing, 0, z * spacing]}
          height={height}
          color={color}
        />
      );
    }
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>

      <gridHelper 
        args={[100, 100, '#666666', '#222222']} 
        position={[0, 0.01, 0]}
      />

      {buildings}

      {threats.map(threat => (
        <ThreatMarker 
          key={threat._id || threat.id}
          position={threat.position}
          severity={threat.severity}
          resolved={threat.resolved}
          onClick={(e) => {
            e.stopPropagation();
            onThreatClick(threat);
          }}
        />
      ))}
    </group>
  );
}

// Scene Component
function Scene({ threats, onAddThreat, onThreatClick, isAddingThreat }) {
  const handlePlaneClick = (event) => {
    if (!isAddingThreat) return;
    event.stopPropagation();
    const position = event.point;
    onAddThreat(position);
  };

  return (
    <Canvas 
      camera={{ 
        position: [25, 25, 25],
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#1a1a1a']} />
      <fog attach="fog" args={['#1a1a1a', 30, 100]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 20, 10]} intensity={1} />
      <directionalLight 
        position={[5, 5, 5]}
        intensity={0.5}
        castShadow
      />
      
      <CityGrid 
        threats={threats}
        onAddThreat={onAddThreat}
        onThreatClick={onThreatClick}
      />

      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        onClick={handlePlaneClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          transparent
          opacity={0}
        />
      </mesh>

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={10}
        maxDistance={100}
      />
    </Canvas>
  );
}


// SystemMetrics Component
const SystemMetrics = () => (
    <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
      <h2 className="text-sm font-semibold mb-3 flex items-center">
        <Activity className="w-4 h-4 mr-2" />
        System Metrics
      </h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-xs p-2 bg-gray-900/50 rounded flex items-center justify-between">
          <div className="flex items-center">
            <Cpu className="w-3 h-3 mr-1" />
            <span className="text-gray-400">CPU</span>
          </div>
          <span className="text-green-400">32%</span>
        </div>
        <div className="text-xs p-2 bg-gray-900/50 rounded flex items-center justify-between">
          <div className="flex items-center">
            <Thermometer className="w-3 h-3 mr-1" />
            <span className="text-gray-400">Temp</span>
          </div>
          <span className="text-blue-400">45°C</span>
        </div>
        <div className="text-xs p-2 bg-gray-900/50 rounded flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="w-3 h-3 mr-1" />
            <span className="text-gray-400">Bandwidth</span>
          </div>
          <span className="text-green-400">42MB/s</span>
        </div>
        <div className="text-xs p-2 bg-gray-900/50 rounded flex items-center justify-between">
          <div className="flex items-center">
            <Navigation className="w-3 h-3 mr-1" />
            <span className="text-gray-400">GPS</span>
          </div>
          <span className="text-green-400">Active</span>
        </div>
      </div>
    </div>
  );
  
  // CommunicationsLog Component
  const CommunicationsLog = () => {
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
      const templates = [
        "Drone {id} reporting sector clear",
        "Movement detected in zone {zone}",
        "Signal strength optimized for sector {sector}",
        "Environmental conditions: {condition}",
        "Automated response initiated in area {area}",
        "System diagnostic complete: Status {status}",
        "Threat assessment in progress: Zone {zone}",
        "Perimeter scan completed: Sector {sector}"
      ];
      
      const generateMessage = () => {
        const template = templates[Math.floor(Math.random() * templates.length)];
        return template
          .replace("{id}", Math.floor(Math.random() * 9) + 1)
          .replace("{zone}", ["A1", "B2", "C3", "D4"][Math.floor(Math.random() * 4)])
          .replace("{sector}", ["North", "South", "East", "West"][Math.floor(Math.random() * 4)])
          .replace("{condition}", ["Optimal", "Moderate", "Challenging"][Math.floor(Math.random() * 3)])
          .replace("{area}", Math.floor(Math.random() * 99))
          .replace("{status}", ["Nominal", "Optimal", "Enhanced"][Math.floor(Math.random() * 3)]);
      };
  
      const interval = setInterval(() => {
        setMessages(prev => {
          const newMessages = [...prev, { 
            id: Date.now(), 
            text: generateMessage(),
            timestamp: new Date().toLocaleTimeString()
          }].slice(-12);
          return newMessages;
        });
      }, 3000);
  
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="flex-1 bg-gray-900/50 rounded-lg p-2 backdrop-blur-sm border border-gray-700/50 overflow-hidden flex flex-col">
        <div className="text-xs text-gray-400 mb-2 flex justify-between items-center">
          <span>COMMS TRAFFIC</span>
          <span className="text-blue-400">Live</span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs bg-gray-800/50 p-2 rounded">
                <span className="text-blue-400">[{msg.timestamp}]</span> {msg.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  const ThreatDetailsDialog = ({ threat, isOpen, onClose, onUpdate, onDelete }) => {
    const [editedThreat, setEditedThreat] = useState(threat);
    const [isEditing, setIsEditing] = useState(false);
    const [resolutionNotes, setResolutionNotes] = useState('');
  
    useEffect(() => {
      setEditedThreat(threat);
      setIsEditing(false);
      setResolutionNotes('');
    }, [threat]);
  
    const handleResolution = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/threats/${editedThreat._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to resolve threat');
        }
  
        // Remove threat from state and close dialog
        onDelete(editedThreat._id);
        onClose();
      } catch (error) {
        console.error('Error resolving threat:', error);
      }
    };
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${
                editedThreat.severity === 'Critical' ? 'text-red-500' :
                editedThreat.severity === 'High' ? 'text-orange-500' :
                editedThreat.severity === 'Medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
              {isEditing ? 'Edit Threat Details' : 'Threat Details'}
            </DialogTitle>
          </DialogHeader>
  
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                ID: {editedThreat._id || editedThreat.id}
              </div>
              {!editedThreat.resolved && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    {isEditing ? 'Cancel Edit' : 'Edit'}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(editedThreat._id || editedThreat.id)}
                    className="bg-red-900/50 hover:bg-red-900/70"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <select 
                  value={editedThreat.type}
                  onChange={(e) => setEditedThreat({...editedThreat, type: e.target.value})}
                  disabled={!isEditing || editedThreat.resolved}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                >
                  {THREAT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Severity</label>
                <select 
                  value={editedThreat.severity}
                  onChange={(e) => setEditedThreat({...editedThreat, severity: e.target.value})}
                  disabled={!isEditing || editedThreat.resolved}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                >
                  {SEVERITIES.map(sev => (
                    <option key={sev} value={sev}>{sev}</option>
                  ))}
                </select>
              </div>
            </div>
  
            <div>
              <label className="text-sm text-gray-400">Description</label>
              <Textarea 
                value={editedThreat.description}
                onChange={(e) => setEditedThreat({...editedThreat, description: e.target.value})}
                disabled={!isEditing || editedThreat.resolved}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
            </div>
  
            {!editedThreat.resolved && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="resolved"
                  checked={editedThreat.resolved}
                  onCheckedChange={(checked) => {
                    setEditedThreat({...editedThreat, resolved: checked});
                    if (checked) {
                      setIsEditing(true);
                    }
                  }}
                  className="border-gray-600"
                />
                <label htmlFor="resolved" className="text-sm text-gray-400">Mark as Resolved</label>
              </div>
            )}
  
            {editedThreat.resolved && (
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Resolution Notes</label>
                <Textarea 
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="bg-gray-800 border-gray-700 min-h-[100px]"
                  placeholder="Enter resolution details (required)"
                />
  
                <Button
                  type="button"
                  onClick={handleResolution}
                  disabled={!resolutionNotes.trim()}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  Confirm Resolution
                </Button>
              </div>
            )}
  
            {editedThreat.resolutionNotes && (
              <div>
                <label className="text-sm text-gray-400">Previous Resolution Notes</label>
                <div className="bg-gray-800 border border-gray-700 rounded-md p-3 mt-1 text-sm">
                  {editedThreat.resolutionNotes}
                </div>
              </div>
            )}
  
            <div className="text-xs text-gray-400 space-y-1">
              <div>Created: {new Date(editedThreat.created_at).toLocaleString()}</div>
              {editedThreat.resolved && editedThreat.resolutionTimestamp && (
                <div>Resolved: {new Date(editedThreat.resolutionTimestamp).toLocaleString()}</div>
              )}
            </div>
          </div>
  
          {isEditing && !editedThreat.resolved && (
            <DialogFooter>
              <Button
                type="button"
                onClick={() => onUpdate(editedThreat)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  };



  // Main Dashboard Component
const Dashboard = ({ userData, onLogout }) => {
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [threats, setThreats] = useState([]);
    const [selectedThreat, setSelectedThreat] = useState(null);
    const [isAddingThreat, setIsAddingThreat] = useState(false);
  
    // Load threats on mount
    useEffect(() => {
      const loadThreats = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/threats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to load threats');
          }
          const data = await response.json();
          setThreats(data);
        } catch (error) {
          console.error('Error loading threats:', error);
        }
      };
      loadThreats();
    }, []);
  
    const toggleSidebars = () => {
      setLeftSidebarOpen(prev => !prev);
      setRightSidebarOpen(prev => !prev);
    };
  
    const handleAddThreat = async (position) => {
      const newThreat = {
        position,
        type: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
        severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
        sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
        description: `Potential security incident detected requiring immediate attention in sector ${
          SECTORS[Math.floor(Math.random() * SECTORS.length)]
        }`,
        resolved: false,
        resolutionNotes: '',
        created_at: new Date().toISOString(),
        assignedDrone: Math.floor(Math.random() * 10) + 1
      };
  
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/threats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newThreat),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save threat');
        }
  
        const data = await response.json();
        const savedThreat = { ...newThreat, _id: data.id };
        setThreats(prev => [...prev, savedThreat]);
        setSelectedThreat(savedThreat);  // Open dialog automatically
      } catch (error) {
        console.error('Error saving threat:', error);
      }
  
      setIsAddingThreat(false);
    };
  
    const handleThreatUpdate = async (updatedThreat) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/threats/${updatedThreat._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedThreat),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update threat');
        }
  
        setThreats(prev => 
          prev.map(threat => 
            threat._id === updatedThreat._id ? updatedThreat : threat
          )
        );
        setSelectedThreat(null);
      } catch (error) {
        console.error('Error updating threat:', error);
      }
    };
  
    const handleThreatDelete = async (threatId) => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/threats/${threatId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
      
          if (!response.ok) {
            throw new Error('Failed to delete threat');
          }
      
          // Remove from local state
          setThreats(prev => prev.filter(threat => threat._id !== threatId));
          setSelectedThreat(null);
        } catch (error) {
          console.error('Error deleting threat:', error);
        }
      };
  
    // Generate drones data
    const drones = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      battery: Math.floor(Math.random() * 30) + 70,
      signal: ['Strong', 'Good', 'Moderate'][Math.floor(Math.random() * 3)],
      status: Math.random() > 0.2 ? 'active' : 'maintenance',
      mission: ['Patrol', 'Surveillance', 'Investigation'][Math.floor(Math.random() * 3)],
      sector: SECTORS[Math.floor(Math.random() * SECTORS.length)]
    }));
  
    return (
      <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-700/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
                Defense Command Center
              </h1>
              <div className="px-2 py-1 bg-gray-800/50 rounded-md text-xs border border-gray-700/50">
                <Clock className="w-3 h-3 inline mr-1" />
                {new Date().toLocaleTimeString()}
              </div>
              <div className="px-2 py-1 bg-blue-500/10 rounded-md text-xs border border-blue-500/20">
                <User className="w-3 h-3 inline mr-1" />
                Operator: {userData?.username}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebars}
                className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 transition-colors"
              >
                {leftSidebarOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsAddingThreat(!isAddingThreat)}
                className={`p-2 rounded-lg border transition-colors ${
                  isAddingThreat 
                    ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
                }`}
              >
                <CrosshairIcon className="w-4 h-4" />
              </button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onLogout}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit System
              </Button>
            </div>
          </div>
        </header>
  
        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div 
            className={`${leftSidebarOpen ? 'w-80' : 'w-0'} 
              bg-gray-900/80 backdrop-blur-md border-r border-gray-700/50 
              transition-all duration-300 flex flex-col overflow-hidden`}
          >
            {leftSidebarOpen && (
              <div className="p-4 h-full flex flex-col">
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <h2 className="text-sm font-semibold mb-3 flex items-center">
                    <Server className="w-4 h-4 mr-2" />
                    System Status
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs p-2 bg-gray-900/50 rounded">
                      <div className="text-gray-400">Network</div>
                      <div className="text-green-400">98.2ms</div>
                    </div>
                    <div className="text-xs p-2 bg-gray-900/50 rounded">
                      <div className="text-gray-400">Load</div>
                      <div className="text-blue-400">42%</div>
                    </div>
                  </div>
                </div>
  
                <SystemMetrics />
                <CommunicationsLog />
              </div>
            )}
          </div>
  
          {/* Main Content */}
          <div className="flex-1 relative">
            <Scene 
              threats={threats}
              onAddThreat={handleAddThreat}
              onThreatClick={setSelectedThreat}
              isAddingThreat={isAddingThreat}
            />
            
            <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-md p-4 rounded-lg border border-gray-700/50">
            <h3 className="text-sm font-semibold mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Threat Analysis
            </h3>
            <div className="flex flex-col gap-2">
                <div className="flex items-center text-red-400">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>{threats.length} Active</span>
                </div>
                <div className="text-xs text-gray-400">
                {threats.filter(t => t.severity === 'Critical').length} Critical
                </div>
            </div>
            </div>
  
            {isAddingThreat && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                bg-red-500/20 text-red-100 px-4 py-2 rounded-full border border-red-500/50">
                Click anywhere on the map to add a threat
              </div>
            )}
          </div>
  
          {/* Right Sidebar */}
          <div 
            className={`${rightSidebarOpen ? 'w-80' : 'w-0'} 
              bg-gray-900/80 backdrop-blur-md border-l border-gray-700/50 
              transition-all duration-300 overflow-hidden`}
          >
            {rightSidebarOpen && (
              <div className="p-4 h-full flex flex-col">
                <h2 className="text-sm font-semibold mb-4 flex items-center">
                  <Signal className="w-4 h-4 mr-2" />
                  Drone Status
                </h2>
                <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 pr-2">
                  {drones.map((drone) => (
                    <div key={drone.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800/70 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Radio className="w-4 h-4 mr-2" />
                          <span>Drone {drone.id}</span>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${
                          drone.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Battery</span>
                          <span className={`${
                            drone.battery > 80 ? 'text-green-400' : 
                            drone.battery > 50 ? 'text-blue-400' : 
                            'text-yellow-400'
                          }`}>{drone.battery}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Signal</span>
                          <span className={`${
                            drone.signal === 'Strong' ? 'text-green-400' :
                            drone.signal === 'Good' ? 'text-blue-400' :
                            'text-yellow-400'
                          }`}>{drone.signal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mission</span>
                          <span>{drone.mission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sector</span>
                          <span>{drone.sector}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Threat Details Dialog */}
        {selectedThreat && (
          <ThreatDetailsDialog
            threat={selectedThreat}
            isOpen={!!selectedThreat}
            onClose={() => setSelectedThreat(null)}
            onUpdate={handleThreatUpdate}
            onDelete={handleThreatDelete}
          />
        )}
      </div>
    );
  };
  
  export default Dashboard;