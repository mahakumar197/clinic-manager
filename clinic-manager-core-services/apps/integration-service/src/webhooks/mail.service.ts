import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import * as cheerio from 'cheerio';
import { PatientForm } from './entity/patient-form.entity';
import { API_ENDPOINTS, helpers } from '@pallmall/common-utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService implements OnModuleInit {
    constructor(
        @InjectRepository(PatientForm)
        private readonly patientFormRepo: Repository<PatientForm>,
        private configService: ConfigService,
    ) { }

    async onModuleInit() {
        await this.startMailListener();
    }

    private async startMailListener() {
        const client = new ImapFlow({
            host: process.env.IMAP_HOST,
            port: Number(process.env.IMAP_PORT),
            secure: true,
            auth: {
                user: process.env.IMAP_USER,
                pass: process.env.IMAP_PASSWORD,
            },
        });
        await client.connect();
        await client.mailboxOpen('INBOX');
        console.log('Mail listener started...');
        client.on('exists', async () => {
            console.log('New mail received');
            await this.processLatestMail(client);
        });
    }

    private async processLatestMail(client: ImapFlow,) {
        try {
            const mailbox = client.mailbox;
            if (!mailbox) {
                return;
            }
            const latestSeq = mailbox.exists;
            const messages = client.fetch(`${latestSeq}:${latestSeq}`, {
                uid: true,
                source: true,
            });
            for await (const msg of messages) {
                const parsed = await simpleParser(msg.source);
                const subject = parsed.subject || '';
                const allowedSubjects = [
                    'questionnaire',
                    'form',
                    'consultation',
                    'getting to know you',
                    'patient',
                ];
                const isRelevant = allowedSubjects.some((keyword) =>
                    subject.toLowerCase().includes(keyword),
                );
                if (!isRelevant) {
                    console.log('Skipping unrelated email');
                    return;
                }
                const html = (parsed.html || '') as string;
                const data = this.parseMail(html);
                const operationsBase = this.configService.get('BASE_OPERATIONS');
                let userId = null;
                try {
                    const user = await helpers.fetchUserByNameOrEmail(
                        operationsBase,
                        API_ENDPOINTS.OPERATIONS_SERVICE.FIND_USER_BY_NAME_OR_EMAIL,
                        data.email,
                    );
                    userId = user?.id || null;
                } catch {
                    console.log('User not found');
                }
                await this.patientFormRepo.save({
                    ...data,
                    userId,
                });
            }
        } catch (error) {
            console.error('Error processing latest mail:', error);
        }
    }

    private parseMail(html: string) {
        const $ = cheerio.load(html);

        const result = {
            form_name: '',
            form_link: '',
            helper_form_name: '',
            patient_name: '',
            email: '',
            unique_id: '',
        };
        $('table').each((_, table) => {
            const text = $(table).text();
            if (
                text.includes('Form name') &&
                text.includes('Form link') &&
                text.includes('Helper form name')
            ) {
                const row = $(table).find('tr').eq(1);
                const cells = row.find('td');

                result.form_name = $(cells[0]).text().trim();

                const anchor = $(cells[1]).find('a');

                result.form_link =
                    anchor.text().trim() ||
                    anchor.attr('href') ||
                    $(cells[1]).text().trim();

                result.helper_form_name = $(cells[2]).text().trim();
            }
            if (
                text.includes('Patient name') &&
                text.includes('Email') &&
                text.includes('UNIQUE ID')
            ) {
                $(table)
                    .find('tr')
                    .each((_, row) => {
                        const cells = $(row).find('td');

                        if (cells.length !== 2) return;

                        const key = $(cells[0]).text().trim();
                        const value = $(cells[1]).text().trim();

                        if (key.includes('Patient name')) {
                            result.patient_name = value;
                        }

                        if (key === 'Email') {
                            result.email = value;
                        }

                        if (key.includes('UNIQUE ID')) {
                            result.unique_id = value;
                        }
                    });
            }
        });
        return result;
    }

}