import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

interface AppleSignInButtonProps {
  onPress: () => void;
}

export function AppleSignInButton({ onPress }: AppleSignInButtonProps) {
  if (Platform.OS !== 'ios') return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={999}
      style={{ width: '100%', height: 48 }}
      onPress={onPress}
    />
  );
}
