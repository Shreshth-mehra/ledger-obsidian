import React from 'react';
import styled from 'styled-components';

const SectionContainer = styled.div`
  margin: 1rem 0;
  border: 1px solid var(--background-modifier-border);
  border-radius: 4px;
`;

const SectionHeader = styled.div<{ isExpanded: boolean }>`
  padding: 0.75rem 1rem;
  background: var(--background-secondary);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: var(--background-modifier-hover);
  }
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  font-size: 0.8rem;
  color: var(--text-muted);
  transform: ${props => props.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const SectionContent = styled.div<{ isExpanded: boolean }>`
  padding: ${props => props.isExpanded ? '1rem' : '0'};
  max-height: ${props => props.isExpanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
`;

export const CollapsibleSection: React.FC<{
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultExpanded = false, children }): JSX.Element => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const toggleExpanded = (): void => {
    setIsExpanded(!isExpanded);
  };

  return (
    <SectionContainer>
      <SectionHeader isExpanded={isExpanded} onClick={toggleExpanded}>
        <h3>{title}</h3>
        <ExpandIcon isExpanded={isExpanded}>▶</ExpandIcon>
      </SectionHeader>
      <SectionContent isExpanded={isExpanded}>
        {children}
      </SectionContent>
    </SectionContainer>
  );
};
