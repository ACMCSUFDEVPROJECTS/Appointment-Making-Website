import cton from '../controllers/canvasToNotion';

// jest.mock('../controllers/canvasToNotion');

const sample = {
    name: 'Test',
    course: 'CPSC 362',
    description: 'Make sure this works',
    due_date: '2021-09-30',
    points: 100,
    link: 'acmcsuf.com'
};

const sampleResult = {
    Name: {
        title: [
            {
                type: 'text',
                text: {
                    content: sample.name
                }
            }
        ]
    },
    Class: {
        rich_text: [
            {
                type: 'text',
                text: {
                    content: sample.course,
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
                    content: sample.description,
                    link: null
                }
            }
        ]
    },
    'Due Date': {
        date: {
            start: new Date(sample.due_date).toISOString(),
            end: null
        }
    },
    Points: {
        number: sample.points
    },
    Link: {
        url: sample.link
    }
};

test('validateFormatAssignment', () => {
    let target = new cton();
    expect(target.formatAssignment(sample)).toStrictEqual(sampleResult);
});
