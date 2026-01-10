import type { Component, ComponentProps } from "svelte";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "$env/dynamic/private";
import { inspect } from "util";
import { Renderer } from "better-svelte-email";
import layoutStyles from '../../../routes/layout.css?raw';

export class MailService {
    private readonly transport: Transporter;
    private readonly renderer: Renderer;
    private readonly sender: string;

    constructor() {
        if (!env.SMTP_URL) throw new Error("SMTP_URL is not set");
        const url = new URL(env.SMTP_URL);

        if (!env.SMTP_SENDER) throw new Error("SMTP_SENDER is not set");
        this.sender = env.SMTP_SENDER;

        this.transport = nodemailer.createTransport({
            host: decodeURIComponent(url.hostname),
            port: parseInt(url.port) || 587,
            secure: url.protocol === "smtps:",
            auth: {
                user: decodeURIComponent(url.username),
                pass: decodeURIComponent(url.password),
            },
            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: env.SMTP_REJECT_UNAUTHORIZED !== "0",
            },
        });

        this.transport.verify((err: any, success: any) => {
            if (!success) {
                console.error("Could not initalize Mail service", inspect(err));
            }
        });

        this.renderer = new Renderer({ customCSS: layoutStyles });
    }

    async sendTemplateMail<TComponent extends Component<any>>(props: {
        target: string;
        subject: string;
        template: TComponent;
        props: ComponentProps<TComponent>;
    }) {
        const rendered = await this.renderer.render(props.template as any, { props: props.props });

        await this.transport.sendMail({
            from: this.sender,
            to: props.target,
            subject: props.subject,
            html: rendered,
        });
    }
}