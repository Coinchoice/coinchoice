import styled from 'styled-components';
import { ReactComponent as CC } from '../assets/CoinChoice_Primary_Logo.svg';

const Container = styled.div`
`

export const CCLogo = () => (
  <Container
  >
    <CC height='50px' width='100%' />
  </Container>

);


export const CCLogoFlex = ({ size }: { size: string }) => (
  <Container
  >
    <CC style={{ height: size, width: size }} />
  </Container>

);
