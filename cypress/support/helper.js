import { faker } from '@faker-js/faker';
export function entityValue() {
    return {
        userId: Math.floor(Math.random() * 10) + 1,
        title: faker.lorem.sentence(3),
        author: faker.lorem.paragraphs(1),
        userId: faker.number.int(8)
      };
}