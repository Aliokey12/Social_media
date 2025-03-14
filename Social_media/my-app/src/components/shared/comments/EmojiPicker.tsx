import { useState, useRef, useEffect } from 'react';
import { FiSmile } from 'react-icons/fi';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡'];

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void;
};

const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 rounded-full hover:bg-dark-4 transition-colors"
        aria-label="Emoji seç"
      >
        <FiSmile className="w-4 h-4 sm:w-5 sm:h-5 text-light-4" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-dark-3 rounded-xl shadow-xl p-1.5 sm:p-2 flex gap-1 border border-dark-4 z-20">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                setIsOpen(false);
              }}
              className="p-1.5 sm:p-2 hover:bg-dark-4 rounded-lg transition-colors text-base sm:text-xl"
              aria-label={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmojiPicker; 