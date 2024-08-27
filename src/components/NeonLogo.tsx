// src/components/NeonLogo.tsx
import styled from 'styled-components';

const NeonContainer = styled.div`
  overflow: visible;
  padding: 0 20px; // Add horizontal padding
`;

const NeonText = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.primary};
  text-shadow: 
    0 0 10px ${({ theme }) => theme.colors.primary},
    0 0 4px ${({ theme }) => theme.colors.primary};
  text-align: center;
  margin: 0; // Remove default margin
  padding: 20px 0; // Add vertical padding

  /* Responsive font size */
  @media (max-width: 700px) {
    font-size: 3rem;
  }

  @media (max-width: 450px) {
    font-size: 2rem;
  }
`;

const NeonLogo: React.FC = () => {
  return (
    <NeonContainer>
      <NeonText>TronVolution</NeonText>
    </NeonContainer>
  );
};

export default NeonLogo;