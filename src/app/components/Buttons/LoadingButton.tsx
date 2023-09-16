import React, { ComponentPropsWithoutRef, FC } from "react";
import { LoadingIndicator } from "stream-chat-react";
import Button from "./Button";
interface LoadingButtonProps extends ComponentPropsWithoutRef<"button"> {
  loading: boolean;
}
const LoadingButton: FC<LoadingButtonProps> = ({ loading, ...props }) => {
  return (
    <Button {...props} disabled={loading}>
      {loading ? <LoadingIndicator /> : props.children}
    </Button>
  );
};

export default LoadingButton;
