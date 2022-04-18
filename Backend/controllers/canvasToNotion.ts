import logging from '../utils/logging';
import { Client } from '@notionhq/client';
import config from '../utils/config';
import axios from 'axios';
import { Request } from 'tsoa';

const NAMESPACE = 'yeet';

// req should have domain, canvasToken, notionDb, notionToken
export default class Assignments {
    public async importAssignments(domain: string, canvasToken: string, notionDb: string, notionToken: string, update = false){
        let courses: any;

        let notionClient = new Client({
            auth: notionToken
        });
        
        let canvas = axios.create({
            baseURL: domain + '/api/v1/',
            headers: { Authorization: `Bearer ${canvasToken}` }
        });

        // get courses and filter out ones from the past
        try {
            let course = await canvas.get('/courses');
            courses = course.data.map((course: { id: string, name: string, end_at: string }) => {
                // Probably not the best solution?
                if(Date.parse(course.end_at ?? '01/01/1971') > Date.now())
                {
                    return {
                        [course.id]: course.name
                    };
                }
            });
        } catch (error) {
            logging.error(NAMESPACE, 'Could not get courses', error);
        }

        let assignments: any = [];
        // map class id and name to dictionary
        courses = Object.assign({}, ...courses);

        // get assignments from the canvas API and extract useful info
        for (const course in courses)
        {
            try {
                let assignment = await canvas.get(`/courses/${course}/assignments`);

                var mapped = assignment.data.map((result: { id: any; name: any; course_id: string | number; due_at: any; points_possible: any; html_url: any }) => {
                    return {
                        id: result.id,
                        name: result.name,
                        course: courses[course],
                        due_date: result.due_at,
                        points: result.points_possible,
                        link: result.html_url
                    };
                });
                assignments.push(mapped);
            } catch (error) {
                logging.error(NAMESPACE, `Could not get assignments for class ${course}`);
            }
        }

        // format assignments and upload to notion
        for (const assignment of assignments) {
            if(update)
            {
                // basically same code as below but update stuff
                break;
            }
            else
            {
                try {
                await Promise.all(
                    assignment.map((result: { name: string; course?: string; description?: string; due_date: string; points?: number; link?: string }) => {
                        notionClient.pages.create({
                            parent: { database_id: notionDb },
                            // @ts-ignore
                            properties: this.formatAssignment(result)
                        });
                        logging.info(NAMESPACE, `Completed import of ${result.name}`);
                    })
                );
                }
                catch (error){
                    logging.error(NAMESPACE, `Assignment ${assignment.name} could not be imported`);
                }
            }
        }

        console.log('success?');
    };

    public formatAssignment(assignment: { name: string; course: string; description: string; due_date: string; points: number; link: string }) {
        const { name, course, description, due_date, points, link } = assignment;
    
        return {
            Name: {
              'title': [
                {
                  'text': {
                    'content': name
                  }
                }
              ]
            },
            Class: {
                'rich_text': [
                  {
                    'type': 'text',
                    'text': {
                      'content': course,
                      link: null
                    }
                  }
                ]
              },
            'Due Date': {
              'date': {
                'start': new Date(due_date).toISOString() ?? null,
                'end': null
              }
            },
            Points: {
              'number': points
            },
            Link: {
              'url': link
            }
        }
    }
}
