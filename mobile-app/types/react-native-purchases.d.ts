declare module 'react-native-purchases' {
  const RNPurchases: {
    configure(options: { apiKey: string }): Promise<void>;
    logIn(appUserId: string): Promise<{ customerInfo: any }>;
    getOfferings(): Promise<{ current: { availablePackages: any[] } | null }>;
    purchasePackage(pkg: any): Promise<{ customerInfo: any }>;
    restorePurchases(): Promise<any>;
  };
  export default RNPurchases;
}
