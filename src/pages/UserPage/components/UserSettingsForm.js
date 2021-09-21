import React, { useEffect, useState } from "react";
import ImageUploading from "react-images-uploading";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { setUserSettings } from "../../../redux/actions.user";
import { userSettingsRequestWithImage } from "../../../helpers/requsts.server";
import Button from "../../../components/Buttons/Button";
import UserImageEditor from "./UserImageEditor";
import LoadingOverlay from "../../../components/Loading/LoadingOverlay";
import { SETTINGS } from "../../../settings/settings";
import classesCss from "../UserPage.module.scss";

export default function UserSettingsForm() {
  const { settings: userSettings, onLoading, token, id } = useSelector(
    (state) => state.user
  );
  const [currentImage, setCurrentImage] = useState({
    url: null,
    files: null,
  });
  const [form, setForm] = useState({ name: "" });
  const [onSendLoading, setOnSendLoading] = useState(false);
  const dispatch = useDispatch();

  async function sendHandler() {
    const data = new FormData();
    const settingsForServer = { optional: { ...userSettings.optional } };
    if (currentImage.files && currentImage.files[0]?.file) {
      data.append("image", currentImage.files[0].file);
    } else if (!currentImage.url) {
      data.append("removeImage", "true");
      settingsForServer.optional.image = "";
    }
    data.append("settings", JSON.stringify(settingsForServer));
    setOnSendLoading(true);
    const rawRes = await userSettingsRequestWithImage({ token, id, data });
    const res = await rawRes.json();
    setOnSendLoading(false);
    dispatch(
      setUserSettings({
        optional: res.optional,
      })
    );
  }

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function imageUpdateHandler(files) {
    setCurrentImage({
      url: files[0] ? files[0].dataUrl : null,
      files,
    });
  }

  useEffect(() => {
    if (!currentImage.url && userSettings.optional?.image) {
      setCurrentImage((imageData) => {
        return {
          ...imageData,
          url: `${SETTINGS.AWS_STORE_URL}/${userSettings.optional.image}`,
        };
      });
    }
  }, [userSettings.optional?.image]);

  useEffect(() => {
    if (userSettings.optional?.name) {
      setForm((currentFormData) => ({
        ...currentFormData,
        name: userSettings.optional.name,
      }));
    }
  }, [userSettings.optional?.name]);

  return (
    <div className={classesCss.UserSettingsBlock}>
      {onSendLoading ? (
        <LoadingOverlay className={classesCss.LoadingOverlay} />
      ) : null}
      <ImageUploading
        value={currentImage.files}
        onChange={imageUpdateHandler}
        maxNumber={1}
        dataURLKey="dataUrl"
      >
        {({
          onImageUpload,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps,
        }) => {
          return (
            <div className={classesCss.UploadImageWrap}>
              {onLoading ? (
                <div>Loading...</div>
              ) : currentImage?.url ? (
                <UserImageEditor
                  image={currentImage.url}
                  onUpdate={onImageUpdate}
                  onRemove={() => {}}
                />
              ) : (
                <Button
                  className={classesCss.ImageLoadButton}
                  style={isDragging ? { color: "red" } : null}
                  onClick={onImageUpload}
                  label={"Нажмите сюда или перетащите картинку"}
                  {...dragProps}
                />
              )}
            </div>
          );
        }}
      </ImageUploading>
      <input
        type={"text"}
        name={"name"}
        value={form.name}
        className={cx(classesCss.Input, { [classesCss.Empty]: !form.name })}
        onChange={updateForm}
        autoComplete={"off"}
        placeholder={"Имя"}
      />
      <Button
        disabled={onSendLoading}
        onClick={sendHandler}
        label={"Сохранить"}
        className={classesCss.SendButton}
      />
    </div>
  );
}
