module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      build:{
        files: {
              'public/dist/main_concat.js' : ['public/client/*.js'],
              'public/dist/lib_concat.js' : [
                'public/lib/jquery.js',
                'public/lib/underscore.js',
                'public/lib/backbone.js',
                'public/lib/handlebars.js'
              ],        
        },
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/ServerSpec.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      build: {
        files: {
              'public/dist/main_concat.min.js' : ['public/dist/main_concat.js'],
              'public/dist/lib_concat.min.js' : ['public/dist/lib_concat.js'],        
        },
      }
    },

    jshint: {
      files: [
        'app/*.js',
        'app/*/*.js',
        'public/client/*.js'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      build: {
          src: 'public/style.css',
          dest: 'public/dist/style.min.css'
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: 'git push azure master',
      }
    },

    clean: {
      foo: {
        src: ['public/dist/lib_concat.js', 'public/dist/main_concat.js' ],

      },

    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'jshint',
    'concat',
    'uglify', 
    'cssmin',
    'clean'
    // grunt.file.delete('public/dist/main_concat.js')
  ]);



  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run(['test', 'build', 'shell']);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
  ]);


};
