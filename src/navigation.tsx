import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalculatorScreen } from './screens/CalculatorScreen';
import { OfferScreen } from './screens/OfferScreen';
import { PricesScreen } from './screens/PricesScreen';
import type { CalculationResult, DimensionItem } from './types';
import { colors } from './theme';

export type RootStackParamList = {
  Calculator: undefined;
  Prices: undefined;
  Offer: {
    walls: DimensionItem[];
    openings: DimensionItem[];
    perimeterLm: string;
    result: CalculationResult;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Calculator"
          component={CalculatorScreen}
          options={{ title: 'Ремонт калкулатор' }}
        />
        <Stack.Screen
          name="Prices"
          component={PricesScreen}
          options={{ title: 'Цени на дейности' }}
        />
        <Stack.Screen
          name="Offer"
          component={OfferScreen}
          options={{ title: 'PDF оферта' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
