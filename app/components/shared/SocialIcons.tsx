import React from 'react';
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  YoutubeIcon, 
  MessageCircleIcon, 
  PhoneIcon, 
  MapPinIcon, 
  MailIcon,
  XIcon,
  Send,
  // Telegram, 
  Linkedin,
} from 'lucide-react';

interface SocialIconProps {
  iconName: string;
  className?: string;
  size?: number;
}

const socialIconMap: { [key: string]: React.ElementType } = {
  'facebook': FacebookIcon,
  'twitter': TwitterIcon,
  'instagram': InstagramIcon,
  'linkedin': LinkedinIcon,
  'youtube': YoutubeIcon,
  'message-circle': MessageCircleIcon,
  'phone': PhoneIcon,
  'map-pin': MapPinIcon,
  'mail': MailIcon,
  'telegram': Send,
  'linkedIn': Linkedin,
  // Add more social icons as needed
};

export function SocialIcon({ iconName, className = '', size = 16 }: SocialIconProps) {
  const IconComponent = socialIconMap[iconName] || XIcon; // Fallback to XIcon
  
  return (
    <IconComponent 
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

// Export individual social icon components for direct use
export {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  MessageCircleIcon,
  PhoneIcon,
  MapPinIcon,
  MailIcon,
};