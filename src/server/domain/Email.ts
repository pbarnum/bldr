import nodemailer from 'nodemailer';
import templates from '../templates';
import { Configs } from './Configs';

interface SendArgs {
  from?: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
}

const compileTemplate = (s: string, variables: { [key: string]: unknown }): string => {
  Object.keys(variables).forEach((k) => {
    s = s.replace(k, `${variables[k]}`);
  });
  return s;
};

export default class Email {
  private configs: Configs;
  private emailer: nodemailer.Transporter;
  private verified = false;

  constructor(c: Configs) {
    this.configs = c;
    this.emailer = nodemailer.createTransport({
      host: this.configs.email.host,
      port: this.configs.email.port,
      secure: false,
      auth: {
        user: this.configs.email.auth.user,
        pass: this.configs.email.auth.pass,
      },
    });

    this.emailer.verify((err) => {
      if (err) {
        console.error('failed to verify email connection', err);
        return;
      }

      this.verified = true;
    });
  }

  send(args: SendArgs) {
    if (!this.verified) {
      console.error(`failed to send '${args.subject}' email: transport failed to connect`);
      return;
    }

    return this.emailer.sendMail(
      {
        from: args.from,
        to: args.to,
        cc: args.cc,
        bcc: args.bcc,
        replyTo: args.replyTo,
        subject: args.subject,
        text: args.bodyText,
        html: args.bodyHtml,
      },
      (err) => {
        if (err) {
          console.error(`failed to send '${args.subject}' email`, err);
          return;
        }
        console.log(`sent '${args.subject}' email`);
      }
    );
  }

  invite(to: string, invitor: string, invitee: string, token: string) {
    const variables = {
      '{invitor}': invitor,
      '{invitee}': invitee,
      '{verificationLink}': `${this.configs.api.host}/verify?token=${token}&email=${to}`,
    };

    this.send({
      to,
      from: 'Support <support@bldr.com>',
      replyTo: this.configs.email.system.email,
      subject: 'Welcome to Bldr!',
      bodyText: compileTemplate(templates.invitation.text, variables),
      bodyHtml: compileTemplate(templates.invitation.html, variables),
    });
  }

  verifyAccount(to: string, token: string) {
    const variables = {
      '{verificationLink}': `${this.configs.api.host}/verify?token=${token}&email=${to}`,
    };

    this.send({
      to,
      from: 'Support <support@bldr.com>',
      replyTo: this.configs.email.system.email,
      subject: 'Email Verification',
      bodyText: compileTemplate(templates.verification.text, variables),
      bodyHtml: compileTemplate(templates.verification.html, variables),
    });
  }

  resetPassword(to: string, token: string) {
    const variables = {
      '{resetLink}': `${this.configs.api.host}/password/reset?token=${token}&email=${to}`,
    };

    this.send({
      to,
      from: 'Support <support@bldr.com>',
      subject: 'Password Reset',
      bodyText: compileTemplate(templates.reset.text, variables),
      bodyHtml: compileTemplate(templates.reset.html, variables),
    });
  }

  lockedAccount(to: string) {
    const variables = {
      '{supportEmail}': this.configs.email.system.email,
    };

    this.send({
      to,
      from: `${this.configs.email.system.name} <${this.configs.email.system.email}>`,
      subject: 'Account Locked',
      bodyText: compileTemplate(templates.locked.text, variables),
      bodyHtml: compileTemplate(templates.locked.html, variables),
    });
  }
}
