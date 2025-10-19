export class UpdatePopupCheckResultDto {
  isForceUpdate: boolean;

  showPopup: boolean;

  title: string;

  content: string;

  constructor(
    isForceUpdate: boolean,
    showPopup: boolean,
    title: string,
    content: string,
  ) {
    this.isForceUpdate = isForceUpdate;
    this.showPopup = showPopup;
    this.title = title;
    this.content = content;
  }
}
