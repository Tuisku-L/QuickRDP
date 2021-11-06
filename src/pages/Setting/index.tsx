import React from 'react';

import { Form, Input, Radio, Select, Checkbox, Space, Button, message } from "antd";

interface IState {
    setting: RDP.Setting | null;
    formKey: number;
    personalPwdState: boolean;
}

export default class Index extends React.Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            setting: null,
            formKey: Date.now(),
            personalPwdState: false
        };
    }

    componentDidMount() {
        const setting = window.utools.db.get<RDP.Setting>(`${window.deviceId}/rdp_setting`);
        console.info("setting", setting);
        this.setState({
            setting,
            formKey: Date.now(),
            personalPwdState: setting.vaildType !== "temp"
        });
    }

    actionSaveSetting = (values: RDP.Setting) => {
        const { setting } = this.state;
        values["_id"] = `${window.deviceId}/rdp_setting`;
        values["_rev"] = setting?._rev;
        console.info("values", values);
        window.utools.db.put(values);
        message.success("保存成功");
    }

    public render() {
        const { setting, formKey, personalPwdState } = this.state;

        return <div>
            <Form
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17, offset: 1 }}
                onFinish={this.actionSaveSetting}
                key={formKey}
            >
                <Form.Item
                    label="验证方式"
                    name="vaildType"
                    initialValue={setting ? setting.vaildType : "temp"}
                >
                    <Radio.Group onChange={e => this.setState({ personalPwdState: e.target.value !== "temp" })}>
                        <Space direction="vertical">
                            <Radio value="temp">仅允许动态密码</Radio>
                            <Radio value="personal">仅允许个人密码</Radio>
                            <Radio value="both">允许动态密码与个人密码</Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
                {
                    personalPwdState &&
                    <Form.Item
                        label="个人密码"
                        name="personalPwd"
                        initialValue={setting ? setting.personalPwd : ""}
                    >
                        <Input type="password" />
                    </Form.Item>
                }
                <Form.Item
                    label="动态密码更新"
                    name="changePwd"
                    initialValue={setting ? setting.changePwd : "none"}
                >
                    <Radio.Group>
                        <Space direction="vertical">
                            <Radio value="none">长期使用</Radio>
                            <Radio value="onDisconnection">连接断开后更新</Radio>
                            <Radio value="onBoot">每次启动时更新</Radio>
                        </Space>
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label="连接密码"
                    name="savePwd"
                    valuePropName="checked"
                    initialValue={setting ? setting.savePwd : true}
                >
                    <Checkbox>保存连接密码</Checkbox>
                </Form.Item>
                <Form.Item
                    label="免验证"
                    name="selfConnect"
                    valuePropName="checked"
                    initialValue={setting ? setting.selfConnect : false}
                >
                    <Checkbox>本人 uTools 账号免验证连接</Checkbox>
                </Form.Item>
                <Form.Item
                    label={<span></span>}
                    colon={false}
                >
                    <Button htmlType="submit" type="primary">保存</Button>
                </Form.Item>
            </Form>
        </div>
    };
}
