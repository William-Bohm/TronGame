// src/components/NeonLogo.tsx
import styled from 'styled-components';

const NeonText = styled.h1`
  font-family: 'Orbitron', sans-serif;
  font-size: 4rem;
  color: ${({ theme }) => theme.colors.primary}; /* Use primary theme color */
  text-shadow: 
    0 0 5px ${({ theme }) => theme.colors.primary},
    0 0 10px ${({ theme }) => theme.colors.primary},
    0 0 20px ${({ theme }) => theme.colors.primary},
    0 0 40px ${({ theme }) => theme.colors.primary},
    0 0 80px ${({ theme }) => theme.colors.primary};
  text-align: center;

  /* Responsive font size */
  @media (max-width: 700px) {
    font-size: 3rem;
  }

  @media (max-width: 450px) {
    font-size: 2rem;
  }
`;

const NeonLogo: React.FC = () => {
  return <NeonText>TronVolution</NeonText>;
};

export default NeonLogo;