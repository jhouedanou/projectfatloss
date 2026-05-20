import React from 'react';
import { 
  Dumbbell, 
  ArrowUp, 
  Activity, 
  Sun, 
  Heart, 
  Compass, 
  Shield, 
  Layout, 
  Slash, 
  HelpCircle
} from 'lucide-react';

const getIconComponent = (type, size, color) => {
  const defaultColor = '#F03D32'; // Red accent
  const iconProps = { size, color: color || defaultColor };

  switch (type) {
    case 'dumbbell':
    case 'arm-flex':
    case 'dumbbell_equip':
    case 'barbell':
    case 'bars':
    case 'deadlift':
    case 'shrug':
      return <Dumbbell {...iconProps} />;
    
    case 'arrow-up':
    case 'step-up':
      return <ArrowUp {...iconProps} />;
      
    case 'abs':
    case 'plank':
    case 'twist':
    case 'rowing':
    case 'squat':
    case 'lunge':
    case 'hip-thrust':
    case 'calf':
    case 'leg-raise':
    case 'pushup':
    case 'stretch':
    case 'mobility':
    case 'hip-extension':
    case 'ankle':
      return <Activity {...iconProps} />;
      
    case 'mountain':
      return <Compass {...iconProps} />;
      
    case 'good-morning':
      return <Sun {...iconProps} color="#FFD700" />;
      
    case 'bike':
    case 'cardio':
      return <Heart {...iconProps} color="#F03D32" />;
      
    case 'vest':
      return <Shield {...iconProps} />;
      
    case 'bench':
      return <Layout {...iconProps} />;
      
    case 'none':
      return <Slash {...iconProps} color="#666" />;
      
    default:
      return <Dumbbell {...iconProps} />;
  }
};

export function EquipIcon({ equip, size = 20 }) {
  let type = 'none';
  if (/haltère/i.test(equip)) type = 'dumbbell_equip';
  else if (/barre/i.test(equip)) type = 'barbell';
  else if (/gilet/i.test(equip)) type = 'vest';
  else if (/banc|canapé/i.test(equip)) type = 'bench';
  else if (/cheville/i.test(equip)) type = 'ankle';
  else if (/aucun|optionnel/i.test(equip)) type = 'none';
  
  if (type === 'none') return null;
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
      {getIconComponent(type, size, '#888')}
    </span>
  );
}

export default function ExoIcon({ type, size = 32, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      {getIconComponent(type, size, color)}
    </span>
  );
}
