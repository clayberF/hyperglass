import { useRef } from 'react';
import { Flex, ScaleFade } from '@chakra-ui/react';
import { useColorValue, useBreakpointValue } from '~/context';
import { useBooleanValue, useLGState } from '~/hooks';
import { Title } from './title';

import type { THeader } from './types';

export const Header = (props: THeader) => {
  const { resetForm, ...rest } = props;

  const bg = useColorValue('white', 'black');

  const { isSubmitting } = useLGState();

  const titleRef = useRef({} as HTMLDivElement);

  const titleWidth = useBooleanValue(
    isSubmitting.value,
    { base: '75%', lg: '50%' },
    { base: '75%', lg: '75%' },
  );

  const justify = useBreakpointValue({ base: 'flex-start', lg: 'center' });

  return (
    <Flex
      px={4}
      pt={6}
      bg={bg}
      minH={16}
      zIndex={4}
      as="header"
      width="full"
      flex="0 1 auto"
      color="gray.500"
      {...rest}>
      <ScaleFade in initialScale={0.5} style={{ width: '100%' }}>
        <Flex
          height="100%"
          ref={titleRef}
          maxW={titleWidth}
          // This is here for the logo
          justifyContent={justify}
          mx={{ base: 0, lg: 'auto' }}>
          <Title />
        </Flex>
      </ScaleFade>
    </Flex>
  );
};