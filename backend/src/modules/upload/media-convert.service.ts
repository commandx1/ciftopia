import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MediaConvertClient,
  CreateJobCommand,
  GetJobCommand,
  DescribeEndpointsCommand,
  type Job,
} from '@aws-sdk/client-mediaconvert';
import { randomUUID } from 'crypto';

export type MediaConvertJobStatus =
  | 'SUBMITTED'
  | 'PROGRESSING'
  | 'COMPLETE'
  | 'CANCELED'
  | 'ERROR';

@Injectable()
export class MediaConvertService {
  private bucketName: string;
  private roleArn: string;
  private region: string;
  private accountEndpoint: string | null = null;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('AWS_S3_BUCKET') || '';
    this.roleArn = this.configService.get('MEDIACONVERT_ROLE_ARN') || '';
    this.region = this.configService.get('AWS_REGION') || 'eu-central-1';
  }

  private async getClient(): Promise<MediaConvertClient> {
    if (!this.accountEndpoint) {
      const discovery = new MediaConvertClient({ region: this.region });
      const { Endpoints } = await discovery.send(
        new DescribeEndpointsCommand({ Mode: 'DEFAULT' }),
      );
      const url = Endpoints?.[0]?.Url;
      if (!url) throw new Error('MediaConvert endpoint bulunamadı.');
      this.accountEndpoint = url;
    }
    return new MediaConvertClient({
      region: this.region,
      endpoint: this.accountEndpoint,
    });
  }

  /**
   * S3'teki kaynak videoyu HLS (720p, 480p, 360p) olarak transcode eder.
   * Dönen hlsKey: videos/hls/{jobId}/master.m3u8 — CloudFront ile serve edilir.
   */
  async createHlsJob(sourceKey: string): Promise<{
    jobId: string;
    hlsKey: string;
  }> {
    if (!this.roleArn || !this.bucketName) {
      throw new Error('MEDIACONVERT_ROLE_ARN ve AWS_S3_BUCKET gerekli.');
    }
    const jobId = randomUUID();
    const destinationPrefix = `s3://${this.bucketName}/videos/hls/${jobId}/master`;
    const inputPath = `s3://${this.bucketName}/${sourceKey}`;

    const client = await this.getClient();
    const jobSettings = {
      Inputs: [
        {
          FileInput: inputPath,
          AudioSelectors: {
            'Audio Selector 1': {
              DefaultSelection: 'DEFAULT',
              SelectorType: 'TRACK',
              Tracks: [1],
            },
          },
          VideoSelector: { ColorSpace: 'FOLLOW' },
          TimecodeSource: 'ZEROBASED',
        },
      ],
      OutputGroups: [
        {
          Name: 'Apple HLS',
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              Destination: destinationPrefix,
              SegmentLength: 6,
              MinSegmentLength: 0,
              SegmentControl: 'SEGMENTED_FILES',
              ManifestDurationFormat: 'INTEGER',
              OutputSelection: 'MANIFESTS_AND_SEGMENTS',
              DirectoryStructure: 'SINGLE_DIRECTORY',
              ProgramDateTime: 'EXCLUDE',
              ClientCache: 'ENABLED',
              CodecSpecification: 'RFC_4281',
              StreamInfResolution: 'INCLUDE',
            },
          },
          Outputs: [
            this.hlsOutput(1280, 720, 2500000, '_720'),
            this.hlsOutput(854, 480, 1000000, '_480'),
            this.hlsOutput(640, 360, 600000, '_360'),
          ],
        },
      ],
    };
    const command = new CreateJobCommand({
      Role: this.roleArn,
      UserMetadata: { sourceKey },
      Settings: jobSettings as any,
    });

    const result = await client.send(command);
    const apiJobId = result.Job?.Id;
    if (!apiJobId) throw new Error('MediaConvert job oluşturulamadı.');
    return { jobId: apiJobId, hlsKey: `videos/hls/${jobId}/master.m3u8` };
  }

  private hlsOutput(
    width: number,
    height: number,
    bitrate: number,
    nameModifier: string,
  ) {
    return {
      NameModifier: nameModifier,
      VideoDescription: {
        Width: width,
        Height: height,
        ScalingBehavior: 'DEFAULT',
        TimecodeInsertion: 'DISABLED',
        AntiAlias: 'ENABLED',
        Sharpness: 50,
        CodecSettings: {
          Codec: 'H_264',
          H264Settings: {
            InterlaceMode: 'PROGRESSIVE',
            NumberReferenceFrames: 3,
            Syntax: 'DEFAULT',
            Softness: 0,
            GopClosedCadence: 1,
            GopSize: 90,
            Slices: 1,
            GopBReference: 'DISABLED',
            SpatialAdaptiveQuantization: 'ENABLED',
            TemporalAdaptiveQuantization: 'ENABLED',
            FlickerAdaptiveQuantization: 'DISABLED',
            EntropyEncoding: 'CABAC',
            Bitrate: bitrate,
            FramerateControl: 'INITIALIZE_FROM_SOURCE',
            RateControlMode: 'CBR',
            CodecProfile: 'MAIN',
            Telecine: 'NONE',
            MinIInterval: 0,
            AdaptiveQuantization: 'HIGH',
            CodecLevel: 'AUTO',
            FieldEncoding: 'PAFF',
            SceneChangeDetect: 'ENABLED',
            QualityTuningLevel: 'SINGLE_PASS',
            FramerateConversionAlgorithm: 'DUPLICATE_DROP',
            GopSizeUnits: 'FRAMES',
            ParControl: 'INITIALIZE_FROM_SOURCE',
            NumberBFramesBetweenReferenceFrames: 2,
            RepeatPps: 'DISABLED',
          },
        },
        AfdSignaling: 'NONE',
        DropFrameTimecode: 'ENABLED',
        RespondToAfd: 'NONE',
        ColorMetadata: 'INSERT',
      },
      AudioDescriptions: [
        {
          AudioTypeControl: 'FOLLOW_INPUT',
          CodecSettings: {
            Codec: 'AAC',
            AacSettings: {
              Bitrate: 96000,
              RateControlMode: 'CBR',
              CodecProfile: 'LC',
              CodingMode: 'CODING_MODE_2_0',
              SampleRate: 48000,
              Specification: 'MPEG4',
            },
          },
          LanguageCodeControl: 'FOLLOW_INPUT',
          AudioSourceName: 'Audio Selector 1',
        },
      ],
      ContainerSettings: {
        Container: 'M3U8',
        M3u8Settings: {
          AudioFramesPerPes: 4,
          PcrControl: 'PCR_EVERY_PES_PACKET',
          PmtPid: 480,
          ProgramNumber: 1,
          PatInterval: 0,
          PmtInterval: 0,
          VideoPid: 481,
          AudioPids: [482, 483, 484, 485, 486, 487, 488, 489],
        },
      },
    };
  }

  async getJobStatus(jobId: string): Promise<{ status: MediaConvertJobStatus; job?: Job }> {
    const client = await this.getClient();
    const result = await client.send(new GetJobCommand({ Id: jobId }));
    const status = (result.Job?.Status as MediaConvertJobStatus) || 'ERROR';
    return { status, job: result.Job };
  }
}
