import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Eye, EyeOff, X, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { verifyOwnerPassword } from '../services/api';

interface OwnerPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function OwnerPasswordModal({
  isOpen,
  onClose,
  onAuthenticated,
}: OwnerPasswordModalProps) {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError('Please enter the owner password.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    // Check directly or via server
    const isDirectMatch = password === 'Taksh@28';
    let isServerMatch = false;

    if (!isDirectMatch) {
      isServerMatch = await verifyOwnerPassword(password);
    }

    setIsVerifying(false);

    if (isDirectMatch || isServerMatch) {
      try {
        sessionStorage.setItem('owner_auth_taksh', 'true');
      } catch {}
      setPassword('');
      setError(null);
      onAuthenticated();
    } else {
      setError('Incorrect password. Access denied.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(107,29,47,0.25)] border border-[#F3D8DC] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Lock Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFF5F6] border border-[#F3D8DC] flex items-center justify-center text-[#8C1D30] shadow-sm">
              <Lock className="w-7 h-7 stroke-[1.5]" />
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#1C1917] font-medium">
                Taksh's Dashboard
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Enter your private owner password to manage memories, photos, and video.
              </p>
            </div>

            {/* Password Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-3 pt-2">
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter password..."
                  autoFocus
                  className="w-full pl-4 pr-11 py-3 bg-[#FAF8F5] border border-[#E7CCD0] rounded-xl text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:ring-2 focus:ring-[#8C1D30]/30 focus:border-[#8C1D30] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] p-1 cursor-pointer transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-rose-600 justify-center font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Unlock Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 px-4 rounded-xl font-serif text-sm font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-[#A8A29E] font-light">
              Protected for Taksh Chawariya ❤️
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
