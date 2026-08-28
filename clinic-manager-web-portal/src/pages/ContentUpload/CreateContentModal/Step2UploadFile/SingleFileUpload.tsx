// SingleFileUpload.tsx
import ImageSingleUpload from "./ImageSingleUpload";
import VideoSingleUpload from "./VideoSingleUpload";

interface Props {
  form: any;
  field: any;
  fieldState: any;
  config: { label: string; accept: string[] };
  acceptString: string;
  contentType: string;
}

const SingleFileUpload = (props: Props) => {
  if (props.contentType === "image") {
    return <ImageSingleUpload {...props} />;
  }

  if (props.contentType === "video") {
    return <VideoSingleUpload {...props} />;
  }

  return null;
};

export default SingleFileUpload;
