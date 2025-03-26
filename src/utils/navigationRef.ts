import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../../App"; // Adjust path as needed

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: RootStackParamList[RouteName] 
) {
  if (navigationRef.isReady()) {
    (params !== undefined
      ? navigationRef.navigate(name, params)
      : navigationRef.navigate(name as any) 
    );
  }
}
