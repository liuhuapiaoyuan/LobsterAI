import React, { useRef, useState } from 'react';
import PuzzleIcon from '../icons/PuzzleIcon';
import SkillsPopover from './SkillsPopover';
import { Skill } from '../../types/skill';

interface SkillsButtonProps {
  onSelectSkill: (skill: Skill) => void;
  onManageSkills: () => void;
  className?: string;
}

const SkillsButton: React.FC<SkillsButtonProps> = ({
  onSelectSkill,
  onManageSkills,
  className = '',
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = () => {
    setIsPopoverOpen(prev => !prev);
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        className={`p-2 rounded-xl dark:bg-claude-darkSurface bg-claude-surface dark:text-claude-darkTextSecondary text-claude-textSecondary transition-colors hover:bg-claude-surfaceHover hover:text-claude-accent dark:hover:bg-claude-darkSurfaceHover dark:hover:text-claude-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-claude-accent/30 ${className}`}
        title="Skills"
      >
        <PuzzleIcon className="h-5 w-5" />
      </button>
      <SkillsPopover
        isOpen={isPopoverOpen}
        onClose={handleClosePopover}
        onSelectSkill={onSelectSkill}
        onManageSkills={onManageSkills}
        anchorRef={buttonRef}
      />
    </div>
  );
};

export default SkillsButton;
