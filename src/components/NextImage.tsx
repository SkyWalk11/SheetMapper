import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

type NextImageProps = ImageProps & {
  className?: string;
};

export const NextImage = ({ className, alt, ...props }: NextImageProps) => {
  return (
    <Image
      className={cn('object-cover', className)}
      alt={alt}
      {...props}
    />
  );
};
