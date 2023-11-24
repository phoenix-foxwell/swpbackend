import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommonInput } from './dto/create-common.input';
import { UpdateCommonInput } from './dto/update-common.input';
import { PrismaService } from 'prisma/prisma.service';
import { SearchCommonInput } from './dto/search-common.input';
import { FilterCommonInput, UserType } from './dto/filter-common.input';
import { common } from '@prisma/client';
import { FilterDepartmentCommonInput } from './dto/filterdepartment-common.input';

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCommon() {
    const common = await this.prisma.common.findMany({
      where: { deletedAt: null },
    });
    if (common.length == 0)
      throw new BadRequestException('There is no common.');
    return common;
  }

  async searchCommon(common: SearchCommonInput) {
    if (common.name) {
      const search_name = common.name;
      delete common.name;
      delete common.department;
      const results = await this.prisma.common.findMany({
        where: {
          ...common,
          name: { contains: search_name },
        },
        include: {
          user: true,
        },
      });

      if (results.length == 0)
        throw new BadRequestException('There is no common');
      return results;
    } else {
      if (common.department == null || common.department == undefined) {
        delete common.department;
        const results = await this.prisma.common.findMany({
          where: common,
          include: {
            user: true,
          },
        });

        if (results.length == 0)
          throw new BadRequestException('There is no common');
        return results;
      } else {
        let results = [];

        if (common.department == 'PDA') {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'RTI' },
                { form_type: 'OLDCOPY' },
                { form_type: 'ZONE' },
                { form_type: 'PLINTH' },
                { form_type: 'OC' },
                { form_type: 'CP' },
              ],
            },
            include: {
              user: true,
            },
          });
        } else if (common.department == 'EST') {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'MARRIAGE' },
                { form_type: 'RELIGIOUS' },
                { form_type: 'ROADSHOW' },
                { form_type: 'GENERIC' },
              ],
            },
            include: {
              user: true,
            },
          });
        } else if (common.department == 'CRSR') {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'BIRTHCERT' },
                { form_type: 'BIRTHTEOR' },
                { form_type: 'DEATHCERT' },
                { form_type: 'DEATHTEOR' },
                { form_type: 'MARRIAGECERT' },
                { form_type: 'MARRIAGETEOR' },
                { form_type: 'MARRIAGEREGISTER' },
              ],
            },
            include: {
              user: true,
            },
          });
        } else if (common.department == 'PWD') {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'TEMPWATERCONNECT' },
                { form_type: 'TEMPWATERDISCONNECT' },
                { form_type: 'WATERSIZECHANGE' },
                { form_type: 'NEWWATERCONNECT' },
                { form_type: 'WATERRECONNECT' },
                { form_type: 'PERMANENTWATERDISCONNECT' },
              ],
            },
            include: {
              user: true,
            },
          });
        } else if (common.department == 'DMC') {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'DEATHREGISTER' },
                { form_type: 'BIRTHREGISTER' },
              ],
            },
            include: {
              user: true,
            },
          });
        } else if (
          common.department == 'COLLECTOR' ||
          common.department == 'DYCOLLECTOR'
        ) {
          delete common.department;
          results = await this.prisma.common.findMany({
            where: {
              ...common,
              OR: [
                { form_type: 'BIRTHCERT' },
                { form_type: 'BIRTHTEOR' },
                { form_type: 'DEATHCERT' },
                { form_type: 'DEATHTEOR' },
                { form_type: 'MARRIAGECERT' },
                { form_type: 'MARRIAGETEOR' },
                { form_type: 'MARRIAGEREGISTER' },
                { form_type: 'MARRIAGE' },
                { form_type: 'RELIGIOUS' },
                { form_type: 'ROADSHOW' },
                { form_type: 'GENERIC' },
                { form_type: 'RTI' },
                { form_type: 'OLDCOPY' },
                { form_type: 'ZONE' },
                { form_type: 'PLINTH' },
                { form_type: 'OC' },
                { form_type: 'CP' },
              ],
            },
            include: {
              user: true,
            },
          });
        }

        if (results.length == 0)
          throw new BadRequestException('There is no common');
        return results;
      }
    }
  }

  async filterCommon(filter: FilterCommonInput) {
    if (filter.user_type == UserType.USER) {
      const whereClause: any = { user_id: filter.user_id };

      if (filter.form_type !== null && filter.form_type !== undefined) {
        whereClause.form_type = filter.form_type;
      }
      const result = await this.prisma.common.findMany({
        where: whereClause,
      });
      if (result.length == 0)
        throw new NotFoundException(`NO Common data found for this user. `);
      return result;
    } else {
      const whereClause: any = {
        OR: [
          { auth_user_id: { contains: filter.user_id.toString() } },
          { focal_user_id: { contains: filter.user_id.toString() } },
          { intra_user_id: { contains: filter.user_id.toString() } },
          { inter_user_id: { contains: filter.user_id.toString() } },
        ],
      };

      if (filter.form_type !== null && filter.form_type !== undefined) {
        whereClause.form_type = filter.form_type;
      }
      const result = await this.prisma.common.findMany({
        where: whereClause,
      });
      if (result.length == 0)
        throw new NotFoundException(`NO Common data found for this user. `);

      return result;
    }
  }

  async filterCommonDepartment(filter: FilterDepartmentCommonInput) {
    if (filter.user_type == UserType.USER) {
      const result = await this.prisma.common.findMany({
        where: { user_id: filter.user_id },
      });
      if (result.length == 0)
        throw new NotFoundException(`NO Common data found for this user. `);
      return result;
    } else {
      const whereClause: any = [
        { auth_user_id: { contains: filter.user_id.toString() } },
        { focal_user_id: { contains: filter.user_id.toString() } },
        { intra_user_id: { contains: filter.user_id.toString() } },
        { inter_user_id: { contains: filter.user_id.toString() } },
      ];

      let result: common[] = [];

      if (filter.department == 'CRSR') {
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'BIRTHCERT', OR: whereClause },
              { form_type: 'BIRTHTEOR', OR: whereClause },
              { form_type: 'DEATHCERT', OR: whereClause },
              { form_type: 'DEATHTEOR', OR: whereClause },
              { form_type: 'MARRIAGECERT', OR: whereClause },
              { form_type: 'MARRIAGETEOR', OR: whereClause },
              { form_type: 'MARRIAGEREGISTER', OR: whereClause },
            ],
          },
        });
      } else if (filter.department == 'PDA') {
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'RTI', OR: whereClause },
              { form_type: 'ZONE', OR: whereClause },
              { form_type: 'OLDCOPY', OR: whereClause },
              { form_type: 'PLINTH', OR: whereClause },
              { form_type: 'OC', OR: whereClause },
              { form_type: 'CP', OR: whereClause },
            ],
          },
        });
      } else if (filter.department == 'EST') {
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'MARRIAGE', OR: whereClause },
              { form_type: 'RELIGIOUS', OR: whereClause },
              { form_type: 'ROADSHOW', OR: whereClause },
              { form_type: 'GENERIC', OR: whereClause },
            ],
          },
        });
      } else if (filter.department == 'PWD') {
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'TEMPWATERCONNECT', OR: whereClause },
              { form_type: 'TEMPWATERDISCONNECT', OR: whereClause },
              { form_type: 'WATERSIZECHANGE', OR: whereClause },
              { form_type: 'NEWWATERCONNECT', OR: whereClause },
              { form_type: 'WATERRECONNECT', OR: whereClause },
              { form_type: 'PERMANENTWATERDISCONNECT', OR: whereClause },
            ],
          },
        });
      } else if (filter.department == 'DMC') {
        console.log('dmc');
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'DEATHREGISTER', OR: whereClause },
              { form_type: 'BIRTHREGISTER', OR: whereClause },
            ],
          },
        });
        console.log(result);
      } else if (
        filter.department == 'COLLECTOR' ||
        filter.department == 'DYCOLLECTOR'
      ) {
        result = await this.prisma.common.findMany({
          where: {
            OR: [
              { form_type: 'BIRTHCERT', OR: whereClause },
              { form_type: 'BIRTHTEOR', OR: whereClause },
              { form_type: 'DEATHCERT', OR: whereClause },
              { form_type: 'DEATHTEOR', OR: whereClause },
              { form_type: 'MARRIAGECERT', OR: whereClause },
              { form_type: 'MARRIAGETEOR', OR: whereClause },
              { form_type: 'MARRIAGEREGISTER', OR: whereClause },
              { form_type: 'MARRIAGE', OR: whereClause },
              { form_type: 'RELIGIOUS', OR: whereClause },
              { form_type: 'ROADSHOW', OR: whereClause },
              { form_type: 'GENERIC', OR: whereClause },
              { form_type: 'RTI', OR: whereClause },
              { form_type: 'ZONE', OR: whereClause },
              { form_type: 'OLDCOPY', OR: whereClause },
              { form_type: 'PLINTH', OR: whereClause },
              { form_type: 'OC', OR: whereClause },
              { form_type: 'CP', OR: whereClause },
            ],
          },
        });
      } else {
        result = await this.prisma.common.findMany({
          where: {
            OR: [{ form_type: 'NONE', OR: whereClause }],
          },
        });
      }

      if (result.length == 0)
        throw new NotFoundException(`NO Common data found for this user. `);

      return result;
    }
  }

  async getAllCommonById(id: number) {
    const common = await this.prisma.common.findFirst({
      where: { id, deletedAt: null },
    });
    if (!common) throw new BadRequestException('No common exist with this id.');
    return common;
  }

  async createCommon(common: CreateCommonInput) {
    const dataToCreate: any = {};

    for (const [key, value] of Object.entries(common)) {
      if (value) {
        dataToCreate[key] = value;
      }
    }

    const Common = await this.prisma.common.create({
      data: dataToCreate,
    });

    if (!Common) throw new BadRequestException('Unable to create common');
    return Common;
  }

  async updateCommonById(common: UpdateCommonInput) {
    const dataToUpdate: {
      [key: string]: any;
    } = {};

    for (const [key, value] of Object.entries(common)) {
      if (value) {
        dataToUpdate[key] = value;
      }
    }

    const existingUser = await this.prisma.common.findUnique({
      where: { id: common.id },
    });

    if (!existingUser) {
      throw new NotFoundException(`Common with id ${common.id} not found`);
    }

    const updatedCommon = this.prisma.common.update({
      where: { id: common.id },
      data: dataToUpdate,
    });
    if (!updatedCommon)
      throw new BadRequestException('Unable to update common.');
    return updatedCommon;
  }

  async deleteCommonById(common: UpdateCommonInput) {
    const existing = await this.prisma.common.findUnique({
      where: { id: common.id },
    });

    if (!existing) {
      throw new NotFoundException(`Common with id ${common.id} not found`);
    }

    const deleteCommon = this.prisma.common.update({
      where: { id: common.id },
      data: { deletedAt: common.deletedAt },
    });

    if (!deleteCommon)
      throw new BadRequestException('Unable to update common.');
    return deleteCommon;
  }

  // custom dashboard apis
  async getFileCount(department: string) {
    const countByFormType = {};
    let formTypes = [];
    if (department == 'PDA') {
      formTypes = ['RTI', 'ZONE', 'OLDCOPY', 'OC', 'CP', 'PLINTH'];
    } else if (department == 'EST') {
      formTypes = ['MARRIAGE', 'RELIGIOUS', 'ROADSHOW', 'GENERIC'];
    } else if (department == 'CRSR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
      ];
    } else if (department == 'PWD') {
      formTypes = [
        'TEMPWATERCONNECT',
        'TEMPWATERDISCONNECT',
        'WATERSIZECHANGE',
        'NEWWATERCONNECT',
        'WATERRECONNECT',
        'PERMANENTWATERDISCONNECT',
      ];
    } else if (department == 'DMC') {
      formTypes = ['DEATHREGISTER', 'BIRTHREGISTER'];
    } else if (department == 'COLLECTOR' || department == 'DYCOLLECTOR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
        'MARRIAGE',
        'RELIGIOUS',
        'ROADSHOW',
        'GENERIC',
        'RTI',
        'OLDCOPY',
        'ZONE',
        'OC',
        'CP',
        'PLINTH',
      ];
    } else {
      formTypes = ['NONE'];
    }

    const count = await this.prisma.common.groupBy({
      by: ['form_type'],
      _count: {
        _all: true,
      },
    });

    formTypes.forEach((formType) => {
      const matchingEntry = count.find(
        (entry) => entry.form_type.toUpperCase() === formType.toUpperCase(),
      );
      countByFormType[formType] = matchingEntry ? matchingEntry._count._all : 0;
    });

    return countByFormType;
  }

  async villageFileCount(department: string) {
    if (department == 'PDA') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [
            { form_type: 'RTI' },
            { form_type: 'ZONE' },
            { form_type: 'OLDCOPY' },
            { form_type: 'PLINTH' },
            { form_type: 'OC' },
            { form_type: 'CP' },
          ],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else if (department == 'EST') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [
            { form_type: 'MARRIAGE' },
            { form_type: 'RELIGIOUS' },
            { form_type: 'ROADSHOW' },
            { form_type: 'GENERIC' },
          ],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else if (department == 'CRSR') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [
            { form_type: 'BIRTHCERT' },
            { form_type: 'BIRTHTEOR' },
            { form_type: 'DEATHCERT' },
            { form_type: 'DEATHTEOR' },
            { form_type: 'MARRIAGECERT' },
            { form_type: 'MARRIAGETEOR' },
            { form_type: 'MARRIAGEREGISTER' },
          ],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else if (department == 'PWD') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [
            { form_type: 'TEMPWATERCONNECT' },
            { form_type: 'TEMPWATERDISCONNECT' },
            { form_type: 'WATERSIZECHANGE' },
            { form_type: 'NEWWATERCONNECT' },
            { form_type: 'WATERRECONNECT' },
            { form_type: 'PERMANENTWATERDISCONNECT' },
          ],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else if (department == 'DMC') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [{ form_type: 'DEATHREGISTER' }, { form_type: 'BIRTHREGISTER' }],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else if (department == 'COLLECTOR' || department == 'DYCOLLECTOR') {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [
            { form_type: 'BIRTHCERT' },
            { form_type: 'BIRTHTEOR' },
            { form_type: 'DEATHCERT' },
            { form_type: 'DEATHTEOR' },
            { form_type: 'MARRIAGECERT' },
            { form_type: 'MARRIAGETEOR' },
            { form_type: 'MARRIAGEREGISTER' },
            { form_type: 'MARRIAGE' },
            { form_type: 'RELIGIOUS' },
            { form_type: 'ROADSHOW' },
            { form_type: 'GENERIC' },
            { form_type: 'RTI' },
            { form_type: 'ZONE' },
            { form_type: 'OLDCOPY' },
            { form_type: 'PLINTH' },
            { form_type: 'OC' },
            { form_type: 'CP' },
          ],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    } else {
      const count = await this.prisma.common.groupBy({
        by: ['village'],
        where: {
          OR: [{ form_type: 'NONE' }],
        },
        _count: {
          _all: true,
        },
      });
      const formattedResult = count.map((entry) => ({
        village: entry.village,
        count: entry._count._all,
      }));
      return formattedResult;
    }
  }

  async officerFileCount(department: string) {
    let count: any = [];
    if (department == 'PDA') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [
            { form_type: 'RTI' },
            { form_type: 'ZONE' },
            { form_type: 'OLDCOPY' },
            { form_type: 'PLINTH' },
            { form_type: 'OC' },
            { form_type: 'CP' },
          ],
        },
        _count: {
          _all: true,
        },
      });
    } else if (department == 'EST') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [
            { form_type: 'MARRIAGE' },
            { form_type: 'RELIGIOUS' },
            { form_type: 'ROADSHOW' },
            { form_type: 'GENERIC' },
          ],
        },
        _count: {
          _all: true,
        },
      });
    } else if (department == 'CRSR') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [
            { form_type: 'BIRTHCERT' },
            { form_type: 'BIRTHTEOR' },
            { form_type: 'DEATHCERT' },
            { form_type: 'DEATHTEOR' },
            { form_type: 'MARRIAGECERT' },
            { form_type: 'MARRIAGETEOR' },
            { form_type: 'MARRIAGEREGISTER' },
          ],
        },
        _count: {
          _all: true,
        },
      });
    } else if (department == 'PWD') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [
            { form_type: 'TEMPWATERCONNECT' },
            { form_type: 'TEMPWATERDISCONNECT' },
            { form_type: 'WATERSIZECHANGE' },
            { form_type: 'NEWWATERCONNECT' },
            { form_type: 'WATERRECONNECT' },
            { form_type: 'PERMANENTWATERDISCONNECT' },
          ],
        },
        _count: {
          _all: true,
        },
      });
    } else if (department == 'DMC') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [{ form_type: 'DEATHREGISTER' }, { form_type: 'BIRTHREGISTER' }],
        },
        _count: {
          _all: true,
        },
      });
    } else if (department == 'COLLECTOR' || department == 'DYCOLLECTOR') {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [
            { form_type: 'BIRTHCERT' },
            { form_type: 'BIRTHTEOR' },
            { form_type: 'DEATHCERT' },
            { form_type: 'DEATHTEOR' },
            { form_type: 'MARRIAGECERT' },
            { form_type: 'MARRIAGETEOR' },
            { form_type: 'MARRIAGEREGISTER' },
            { form_type: 'MARRIAGE' },
            { form_type: 'RELIGIOUS' },
            { form_type: 'ROADSHOW' },
            { form_type: 'GENERIC' },
            { form_type: 'RTI' },
            { form_type: 'ZONE' },
            { form_type: 'OLDCOPY' },
            { form_type: 'PLINTH' },
            { form_type: 'OC' },
            { form_type: 'CP' },
          ],
        },
        _count: {
          _all: true,
        },
      });
    } else {
      count = await this.prisma.common.groupBy({
        by: ['auth_user_id'],
        where: {
          OR: [{ form_type: 'NONE' }],
        },
        _count: {
          _all: true,
        },
      });
    }

    const user = await this.prisma.user.findMany({
      take: 70,
      select: { id: true, name: true },
    });

    const formattedCount = count.reduce((result, item) => {
      let label = '';
      if (parseInt(item.auth_user_id) == 0) {
        label = 'No Name';
      } else {
        label = user[parseInt(item.auth_user_id) - 1].name;
      }
      if (label == undefined) {
        label = 'No Name';
      }
      if (item.auth_user_id !== '0') {
        result.push({ count: item._count._all, auth_user_id: label });
      }
      return result;
    }, []);
    return formattedCount;
  }

  async officerFileProgress(department: string) {
    const countByFormType = {};
    let formTypes = [];
    if (department == 'PDA') {
      formTypes = ['RTI', 'ZONE', 'OLDCOPY', 'OC', 'CP', 'PLINTH'];
    } else if (department == 'EST') {
      formTypes = ['MARRIAGE', 'RELIGIOUS', 'ROADSHOW', 'GENERIC'];
    } else if (department == 'CRSR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
      ];
    } else if (department == 'PWD') {
      formTypes = [
        'TEMPWATERCONNECT',
        'TEMPWATERDISCONNECT',
        'WATERSIZECHANGE',
        'NEWWATERCONNECT',
        'WATERRECONNECT',
        'PERMANENTWATERDISCONNECT',
      ];
    } else if (department == 'DMC') {
      formTypes = ['DEATHREGISTER', 'BIRTHREGISTER'];
    } else if (department == 'COLLECTOR' || department == 'DYCOLLECTOR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
        'MARRIAGE',
        'RELIGIOUS',
        'ROADSHOW',
        'GENERIC',
        'RTI',
        'OLDCOPY',
        'ZONE',
        'OC',
        'CP',
        'PLINTH',
      ];
    } else {
      formTypes = ['NONE'];
    }

    const queryStatus = [
      ['NONE', 'SUBMIT', 'INPROCESS', 'QUERYRAISED'],
      ['APPROVED', 'CERTIFICATEGRANT', 'COMPLETED'],
      ['REJCTED'],
    ];

    const count = await this.prisma.common.groupBy({
      by: ['form_type', 'query_status'], // Group by form_type and query_status
      _count: {
        _all: true,
      },
    });

    formTypes.forEach((formType) => {
      const matchingEntries = count.filter(
        (entry) =>
          entry.form_type.toUpperCase() === formType.toUpperCase() &&
          entry.query_status !== undefined, // Check if query_status exists
      );

      const countByStatus = {
        pending: 0,
        completed: 0,
        rejected: 0,
      };

      matchingEntries.forEach((entry) => {
        const status = entry.query_status.toUpperCase();
        if (queryStatus[0].includes(status)) {
          countByStatus.pending += entry._count._all;
        } else if (queryStatus[1].includes(status)) {
          countByStatus.completed += entry._count._all;
        } else if (queryStatus[2].includes(status)) {
          countByStatus.rejected += entry._count._all;
        }
      });

      countByFormType[formType] = countByStatus;
    });

    return countByFormType;
  }

  async villageFileProgress(department: string) {
    let formTypes = [];
    if (department == 'PDA') {
      formTypes = ['RTI', 'ZONE', 'OLDCOPY', 'OC', 'CP', 'PLINTH'];
    } else if (department == 'EST') {
      formTypes = ['MARRIAGE', 'RELIGIOUS', 'ROADSHOW', 'GENERIC'];
    } else if (department == 'CRSR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
      ];
    } else if (department == 'PWD') {
      formTypes = [
        'TEMPWATERCONNECT',
        'TEMPWATERDISCONNECT',
        'WATERSIZECHANGE',
        'NEWWATERCONNECT',
        'WATERRECONNECT',
        'PERMANENTWATERDISCONNECT',
      ];
    } else if (department == 'DMC') {
      formTypes = ['DEATHREGISTER', 'BIRTHREGISTER'];
    } else if (department == 'COLLECTOR' || department == 'DYCOLLECTOR') {
      formTypes = [
        'BIRTHCERT',
        'BIRTHTEOR',
        'DEATHCERT',
        'DEATHTEOR',
        'MARRIAGECERT',
        'MARRIAGETEOR',
        'MARRIAGEREGISTER',
        'MARRIAGE',
        'RELIGIOUS',
        'ROADSHOW',
        'GENERIC',
        'RTI',
        'OLDCOPY',
        'ZONE',
        'OC',
        'CP',
        'PLINTH',
      ];
    } else {
      formTypes = ['NONE'];
    }
    const village = await this.prisma.village.findMany({
      select: { name: true },
    });
    const villageNames = village.map((village) => village.name);
    const counts = await this.prisma.common.groupBy({
      by: ['village', 'form_type'],
      _count: {
        _all: true,
      },
    });

    const formattedResult = villageNames.map((villageName) => {
      const villageCounts = counts.filter(
        (entry) => entry.village === villageName,
      );
      const villageFileCounts = formTypes.map((formType) => {
        const count = villageCounts.find(
          (entry) => entry.form_type === formType,
        );
        return {
          formType: formType,
          count: count ? count._count._all : 0,
        };
      });

      return {
        village: villageName,
        fileCounts: villageFileCounts,
      };
    });
    return formattedResult;
  }
}
