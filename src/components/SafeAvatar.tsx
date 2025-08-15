import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { isSafeImageUrl, getUserInitials } from '@/utils/imageUtils';

interface SafeAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
}

const SafeAvatar: React.FC<SafeAvatarProps> = ({ 
  src, 
  alt = "صورة المستخدم", 
  fallback, 
  className = "h-9 w-9",
  size = 'md',
  name
}) => {
  const [imageError, setImageError] = useState(false);

  // تحديد حجم الأفاتار
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-9 w-9", 
    lg: "h-12 w-12"
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // التحقق من وجود URL صالح وليس من Facebook
  const shouldShowImage = isSafeImageUrl(src) && !imageError;

  // إنشاء الأحرف الأولى للاسم
  const initials = fallback || getUserInitials(name);

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {shouldShowImage && (
        <AvatarImage 
          src={src} 
          alt={alt}
          onError={handleImageError}
        />
      )}
      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default SafeAvatar;
