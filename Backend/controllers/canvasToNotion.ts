import logging from '../utils/logging';
import { Client } from '@notionhq/client';
import axios from 'axios';
import { Body, Get, Post, Query, Route } from 'tsoa';

const NAMESPACE = 'CanvasToNotion';

interface ImportModel {
  domain: string,
  canvasToken: string,
  notionDb: string,
  notionToken: string,
  update: boolean
}

// investigate why the routes are being weird here
@Route('assignments')
export default class Assignments {
    @Post('/')
    public async importAssignments(@Body() params: ImportModel) : Promise<string[]> {
        let courses: any;
        let errors: string[] = [];

        let notionClient = new Client({
            auth: params.notionToken
        });

        let canvas = axios.create({
            baseURL: params.domain + '/api/v1/',
            headers: { Authorization: `Bearer ${params.canvasToken}` }
        });

        // get courses and filter out ones from the past
        try {
            let course = await canvas.get('/courses');
            courses = course.data.map((course: { id: string; name: string; end_at: string }) => {
                // Probably not the best solution?
                if (Date.parse(course.end_at ?? '01/01/1971') > Date.now()) {
                    return {
                        [course.id]: course.name
                    };
                }
            });
        } catch (error) {
            logging.error(NAMESPACE, 'Could not get courses', error);
            errors.push(`Could not get courses from Canvas`);
        }

        let assignments: any = [];
        // map class id and name to dictionary
        courses = Object.assign({}, ...courses);

        // get assignments from the canvas API and extract useful info
        for (const course in courses) {
            try {
                let assignment = await canvas.get(`/courses/${course}/assignments`);

                var mapped = assignment.data.map((result: { id: any; name: any; course_id: string | number; description: string; due_at: any; points_possible: any; html_url: any }) => {
                    return {
                        id: result.id,
                        name: result.name,
                        course: courses[course],
                        description: this.stripHTML(result.description),
                        due_date: result.due_at,
                        points: result.points_possible,
                        link: result.html_url
                    };
                });
                assignments.push(mapped);
            } catch (error) {
                logging.error(NAMESPACE, `Could not get assignments for class ${course}`);
                errors.push(`Could not get assignments for class ${courses[course]}`);
            }
        }

        // format assignments and upload to notion
        for (const assignment of assignments) {
            if (params.update) {
                // basically same code as below but update stuff
                break;
            } else {
                try {
                    await Promise.all(
                        assignment.map((result: { name: string; course?: string; description?: string; due_date: string; points?: number; link?: string }) => {
                            notionClient.pages.create({
                                parent: { database_id: params.notionDb },
                                // @ts-ignore
                                properties: this.formatAssignment(result)
                            });
                            logging.info(NAMESPACE, `Completed import of ${result.name}`);
                        })
                    );
                } catch (error) {
                    logging.error(NAMESPACE, `Assignment ${assignment.name} could not be imported`);
                    errors.push(`Could not import ${assignment.name} from ${assignment.course}`);
                }
            }
        }

        return errors;
    }

    public formatAssignment(assignment: { name: string; course: string; description: string; due_date: string; points: number; link: string }) {
        const { name, course, description, due_date, points, link } = assignment;

        return {
            Name: {
                title: [
                    {
                        type: 'text',
                        text: {
                            content: name
                        }
                    }
                ]
            },
            Class: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: course,
                            link: null
                        }
                    }
                ]
            },
            Description: {
                rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: description,
                            link: null
                        }
                    }
                ]
            },
            'Due Date': {
                date: {
                    start: new Date(due_date).toISOString() ?? null,
                    end: null
                }
            },
            Points: {
                number: points
            },
            Link: {
                url: link
            }
        };
    }

    private stripHTML(html: string): string {
        var strippedHtml = html ? html.replace(/<[^>]+>/g, '') : html;
        return strippedHtml ? strippedHtml.replace(/(<([^>]+)>)/gi, '').substring(0, 200) + '...' : html.substring(0, 200) + '...';
    }
}
