import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";
import { useAirGuard } from "@/state/airguard-store";
import { colors } from "@/theme/index";

export function useHomeDataRefresh() {
  const { actions } = useAirGuard();
  const [refreshing, setRefreshing] = useState(false);

  const refreshHomeData = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await actions.loadHomeData();
    } catch {
      // Store state owns the user-visible error; keep RefreshControl from hanging.
    } finally {
      setRefreshing(false);
    }
  }, [actions, refreshing]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refreshHomeData}
      tintColor={colors.brand}
      colors={[colors.brand, colors.brandCyan]}
      progressBackgroundColor={colors.white}
    />
  );
}
