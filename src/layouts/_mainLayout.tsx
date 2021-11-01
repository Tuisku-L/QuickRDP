import React from 'react';
import { Link } from "umi";

import { Row, Col, Avatar } from "antd";

import styles from "./styles.less";

interface IState {
    userInfo: {
        avatar: string;
        nickname: string;
        type: "member" | "user";
    } | null;
    activePage: "index" | "setting";
}

export default class Index extends React.Component<any, IState>{
    constructor(props: any) {
        super(props);
        this.state = {
            userInfo: null,
            activePage: "index"
        }
    }

    componentDidMount() {
        const userInfo = window.utools.getUser();
        if (userInfo) {
            this.setState({
                userInfo
            });
        }

        this.actionInitSetting();
        this.actionInitRemoteWebRTC();
    }

    actionInitSetting = () => {
        const setting = window.utools.db.get<RDP.Setting>("rdp_setting");
        if (!setting) {
            const defaultSetting: RDP.Setting = {
                _id: "rdp_setting",
                vaildType: "temp",
                personalPwd: "",
                changePwd: "none",
                savePwd: true,
                selfConnect: false
            };

            window.utools.db.put(defaultSetting);
        }
    }

    actionInitRemoteWebRTC = async () => {
        const config = {
            iceServers: []
        };
        const conn = new RTCPeerConnection(config);

        conn.onicecandidate = (e) => {
            console.info("e", e);
            if (e.candidate) {
                console.info("e.candidate", e.candidate);
                conn.addIceCandidate(new RTCIceCandidate(e.candidate));
            }
        };
        const stream = await this.actionGetDisplayStream();
        // @ts-ignore
        conn.addStream(stream);
console.info("!23123123");
        window.socketLocal = window.socketClient.connect("ws://192.168.60.100:9550");

        window.socketLocal.on("rdp_pre_connection", async (data) => {
            console.info("rdp_pre_connection", data);
            const offer = data;
            conn.setRemoteDescription(offer);
            const answer = await conn.createAnswer();
            conn.setLocalDescription(answer);
            window.socketLocal.emit("rdp_webrtc_answer", answer);
        });

        window.socketLocal.on("rdp_connection", async (data) => {
        });
    }

    actionGetDisplayStream = async () => {
        const display = window.utools.getPrimaryDisplay()
        const sources = await window.desktopCapturer.getSources({
            types: ["screen"]
        });
        console.info("display", display, sources);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    // @ts-ignore
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: "screen:1:0"
                    }
                },
            });
            console.info("stream", stream);
            return stream;
        } catch (error) {
            console.info("error", error);
        }
    }

    public render() {
        const { userInfo, activePage } = this.state;

        return <div className={styles.mainBox} style={{ backgroundImage: 'url("mainBg.jpg")' }}>
            <Row className={styles.contentBox}>
                <Col span={6} className={styles.leftNav}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                            <Avatar src={userInfo?.avatar} size={64} />
                        </div>
                        <div className={styles.userName}>{userInfo?.nickname}</div>
                    </div>
                    <div className={styles.menu}>
                        <Link to="/" onClick={() => this.setState({ activePage: "index" })}>
                            <div className={`${styles.line}${activePage === "index" ? ` ${styles.active}` : ""}`}>
                                设备信息
                            </div>
                        </Link>
                        <Link to="/setting" onClick={() => this.setState({ activePage: "setting" })}>
                            <div className={`${styles.line}${activePage === "setting" ? ` ${styles.active}` : ""}`}>
                                高级设置
                            </div>
                        </Link>
                        <Link to="/remote">
                            <div className={`${styles.line}${activePage === "setting" ? ` ${styles.active}` : ""}`}>
                                test
                            </div>
                        </Link>
                    </div>
                </Col>
                <Col span={18} className={styles.mainInfo}>
                    {this.props.children}
                </Col>
            </Row>
        </div>;
    }
}
