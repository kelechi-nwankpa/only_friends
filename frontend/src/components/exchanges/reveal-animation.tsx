'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RevealAnimationProps {
  receiverName: string;
  receiverWishlistId?: string;
  onReveal: () => Promise<void>;
  isRevealing: boolean;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const randomX = Math.random() * 400 - 200;
  const randomRotation = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ backgroundColor: color }}
      initial={{
        opacity: 1,
        y: 0,
        x: 0,
        rotate: 0,
        scale: 1,
      }}
      animate={{
        opacity: [1, 1, 0],
        y: [0, -100, 300],
        x: [0, randomX * 0.3, randomX],
        rotate: [0, randomRotation / 2, randomRotation],
        scale: [1, 1.2, 0.8],
      }}
      transition={{
        duration: 2,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
}

// Confetti burst component
function ConfettiBurst() {
  const colors = [
    '#FF6B6B', // red
    '#4ECDC4', // teal
    '#FFE66D', // yellow
    '#95E1D3', // mint
    '#F38181', // coral
    '#AA96DA', // purple
    '#FCBAD3', // pink
    '#A8D8EA', // light blue
  ];

  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <ConfettiParticle
          key={particle.id}
          delay={particle.delay}
          color={particle.color}
        />
      ))}
    </div>
  );
}

// Sparkle effect component
function SparkleEffect() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.5, times: [0, 0.5, 1] }}
    >
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            rotate: `${i * 45}deg`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
          }}
        >
          <Sparkles className="h-6 w-6 text-yellow-400" style={{ transform: `translateY(-60px)` }} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function RevealAnimation({
  receiverName,
  receiverWishlistId,
  onReveal,
  isRevealing,
}: RevealAnimationProps) {
  const [stage, setStage] = useState<'initial' | 'revealing' | 'revealed'>('initial');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleRevealClick = async () => {
    setStage('revealing');
    await onReveal();

    // Start reveal animation after API call
    setTimeout(() => {
      setShowConfetti(true);
      setStage('revealed');
    }, 800);
  };

  // Reset confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="relative py-8 flex flex-col items-center justify-center min-h-[300px]">
      <AnimatePresence mode="wait">
        {stage === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Mystery gift box */}
            <motion.div
              className="relative"
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Gift className="h-16 w-16 text-primary" />
              </motion.div>

              {/* Animated question marks */}
              <motion.span
                className="absolute -top-2 -right-2 text-2xl"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ?
              </motion.span>
              <motion.span
                className="absolute -bottom-1 -left-2 text-xl text-muted-foreground"
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              >
                ?
              </motion.span>
            </motion.div>

            <p className="text-muted-foreground text-center max-w-xs">
              Your Secret Santa match is waiting to be revealed!
            </p>

            <Button
              size="lg"
              className="gap-2 text-lg px-8"
              onClick={handleRevealClick}
              disabled={isRevealing}
            >
              <Gift className="h-5 w-5" />
              Reveal My Match
            </Button>
          </motion.div>
        )}

        {stage === 'revealing' && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Spinning gift animation */}
            <motion.div
              className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/30"
              animate={{
                rotateY: [0, 360, 720, 1080],
                scale: [1, 1.1, 1.2, 0],
              }}
              transition={{
                duration: 0.8,
                ease: 'easeInOut',
              }}
            >
              <Gift className="h-16 w-16 text-primary" />
            </motion.div>
          </motion.div>
        )}

        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="flex flex-col items-center gap-6 relative"
          >
            {/* Confetti effect */}
            {showConfetti && <ConfettiBurst />}
            {showConfetti && <SparkleEffect />}

            {/* Revealed name with avatar */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-xl">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {receiverName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-muted-foreground">You are buying a gift for</p>
              <motion.p
                className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 10,
                  delay: 0.4,
                }}
              >
                {receiverName}
              </motion.p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3 w-full max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {receiverWishlistId && (
                <Link href={`/lists/${receiverWishlistId}`} className="w-full">
                  <Button className="w-full gap-2">
                    <Gift className="h-4 w-4" />
                    View Their Wishlist
                  </Button>
                </Link>
              )}
              <p className="text-xs text-center text-muted-foreground">
                Time to start shopping!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
