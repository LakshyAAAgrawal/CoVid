# CoVid
## Aim
To provide an environment for easy recording of university lectures and presentations, with a priority to reducing the recorded session file size.

Many students in our university face issues with attending online lectures(during the Covid pandemic and otherwise), mainly due to poor internet connectivity. They were not even able to download the large recorded lecture files. Through CoVid(Co - Video), we aim to reduce the recorded lecture file size. People even with bad internet coverage are able to download the small files easily and view the lecture recordings.

CoVid is a complete suite for conducting live lectures(paired with Google Meet/Zoom/Other video conferencing software) along with support for recording the lectures in as small file as possible. Currently, a 30-minute long lecture presentation can be recorded in a file size of 8.7 MB including audio, whereas a google meet recorded lecture would occupy a file size of roughly 160 MB.
We worked to ensure that the instructors need not change their workflow and hence, the software provides the following features:
1. Completely web browser-based - No software installation
2. Compatible with existing live streaming services(like Google Meet)
3. Support for importing base lectures(as PDF or images), which can be drawn upon during a recording session.
4. Support for touch devices.

## Usage
### For recording
* Load the recording mode(<img src="./res/images/record-mode-button.svg" width="20">)
* Click the start recording(<img src="./res/images/start_recording.svg" width="20">) button to start the recording session.
* Grant microphone access to record audio
* Option to import PDF/Image as base slides(<img src="./res/images/import_base_pdf.svg" width="20">) to draw on top of(instructors mainly use it to load slides with questions written in them).
* Draw over the slides. Slide can be changed by usage of "Next slide", "Previous Slide", "New slide", buttons.
* Colors can be changed by panel on the right, and pointer size can be adjusted by the slider at the bottom.
* After recording session, click Stop Recording(<img src="./res/images/stop_recording.svg" width="20">). A file will be available for download. Distribute the file for sending the recorded session(Along with base lecture slides if used).

### For playback/viewing
* Load the viewing mode(<img src="./res/images/view-mode-button.svg" width="20">)
* Obtain the recorded file along with the base slides.
* Import the base slides(if any)(<img src="./res/images/import_base_pdf.svg" width="20">).
* Import the recorded session file(<img src="./res/images/import_lecture_content.svg" width="20">).
* Click on Play button(<img src="http://www.alexkatz.me/codepen/img/play.png" width="20">). Pause(<img src="http://www.alexkatz.me/codepen/img/pause.png" width="20">) option can be used during playback.
